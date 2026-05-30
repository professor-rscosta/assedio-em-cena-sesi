const Jogo = require('../models/Jogo');
const Usuario = require('../models/Usuario');
const { Badge, Ranking, Analytics } = require('../models');
const { asyncHandler, httpError } = require('../middlewares/error');

// Deriva nível de maturidade a partir do XP total
function nivelPorXp(xp) {
  if (xp >= 200) return 'guardiao';
  if (xp >= 80) return 'agente';
  return 'observador';
}

// ---------- Catálogo ----------
const listarModulos = asyncHandler(async (req, res) => {
  const modulos = await Jogo.listarModulos();
  const progresso = await Jogo.progressoDoUsuario(req.user.id);
  const mapa = Object.fromEntries(progresso.map((p) => [p.modulo_id, p]));
  res.json({ modulos: modulos.map((m) => ({ ...m, progresso: mapa[m.id] || null })) });
});

const listarPerfis = asyncHandler(async (req, res) => {
  res.json({ perfis: await Jogo.listarPerfis() });
});

// ---------- Fluxo de jogo ----------
const iniciar = asyncHandler(async (req, res) => {
  const moduloId = Number(req.params.moduloId);
  const { perfilId = null } = req.body;

  const modulo = await Jogo.modulo(moduloId);
  if (!modulo) throw httpError(404, 'Módulo não encontrado.');

  const inicial = await Jogo.cenarioInicial(moduloId);
  if (!inicial) throw httpError(500, 'Módulo sem cenário inicial configurado.');

  await Jogo.iniciarProgresso(req.user.id, moduloId, perfilId, inicial.id);
  await Jogo.limparRespostas(req.user.id, moduloId);
  await Analytics.registrar({ usuario_id: req.user.id, evento: 'modulo_iniciado', cenario_id: inicial.id });

  const cenario = await Jogo.cenarioComEscolhas(inicial.id);
  const progresso = await Jogo.progresso(req.user.id, moduloId);
  res.json({ cenario, indicadores: extrairIndicadores(progresso) });
});

const cenarioAtual = asyncHandler(async (req, res) => {
  const moduloId = Number(req.params.moduloId);
  const progresso = await Jogo.progresso(req.user.id, moduloId);
  if (!progresso) throw httpError(404, 'Inicie o módulo primeiro.');
  if (!progresso.cenario_atual_id) {
    return res.json({ cenario: null, fim: true, indicadores: extrairIndicadores(progresso) });
  }
  const cenario = await Jogo.cenarioComEscolhas(progresso.cenario_atual_id);
  res.json({ cenario, indicadores: extrairIndicadores(progresso) });
});

const escolher = asyncHandler(async (req, res) => {
  const moduloId = Number(req.params.moduloId);
  const escolhaId = Number(req.body.escolhaId);

  const progresso = await Jogo.progresso(req.user.id, moduloId);
  if (!progresso) throw httpError(404, 'Inicie o módulo primeiro.');

  const escolha = await Jogo.escolha(escolhaId);
  if (!escolha || escolha.cenario_id !== progresso.cenario_atual_id) {
    throw httpError(400, 'Escolha inválida para o cenário atual.');
  }

  // aplica deltas + xp e move para o próximo cenário
  const cenarioOrigem = await Jogo.cenarioComEscolhas(escolha.cenario_id);
  const novoProgresso = await Jogo.aplicarEscolha(req.user.id, moduloId, escolha);
  await Usuario.somarXp(req.user.id, escolha.xp);
  await Jogo.registrarResposta({ usuarioId: req.user.id, moduloId, cenario: cenarioOrigem, escolha });
  const consequencia = await Jogo.consequenciaDaEscolha(escolhaId);

  await Analytics.registrar({
    usuario_id: req.user.id, evento: 'escolha_feita',
    cenario_id: escolha.cenario_id, escolha_id: escolhaId, valor: escolha.xp,
    metadata: { correta: escolha.correta },
  });

  // badges por gatilho
  const badgesNovos = [];
  if (escolha.correta === 1) {
    const b = await Badge.conceder(req.user.id, 'olhar_atento');
    if (b) badgesNovos.push(b);
  }

  // próximo cenário ou fim do módulo
  let proximo = null;
  let fim = false;
  if (novoProgresso.cenario_atual_id) {
    proximo = await Jogo.cenarioComEscolhas(novoProgresso.cenario_atual_id);
    if (proximo && proximo.tipo === 'final') {
      // chegou num nó final: encerra o módulo
      fim = true;
      await finalizarModulo(req.user.id, moduloId, badgesNovos);
    }
  } else {
    fim = true;
    await finalizarModulo(req.user.id, moduloId, badgesNovos);
  }

  // atualiza maturidade global
  const user = await Usuario.porId(req.user.id);
  const novoNivel = nivelPorXp(user.xp_total);
  if (novoNivel !== user.nivel_maturidade) {
    await Usuario.definirMaturidade(req.user.id, novoNivel);
    if (novoNivel === 'guardiao') {
      const b = await Badge.conceder(req.user.id, 'guardiao');
      if (b) badgesNovos.push(b);
    }
  }
  await Ranking.recalcular(req.user.id);

  res.json({
    consequencia,
    proximo,
    fim,
    badgesNovos,
    indicadores: extrairIndicadores(novoProgresso),
    xpGanho: escolha.xp,
    nivelMaturidade: novoNivel,
  });
});

async function finalizarModulo(usuarioId, moduloId, badgesNovos) {
  const progresso = await Jogo.progresso(usuarioId, moduloId);
  if (progresso.concluido) return;
  await Jogo.concluirModulo(usuarioId, moduloId);
  await Analytics.registrar({ usuario_id: usuarioId, evento: 'modulo_concluido', valor: moduloId });
  const b = await Badge.conceder(usuarioId, 'primeiro_passo');
  if (b) badgesNovos.push(b);
}

function extrairIndicadores(p) {
  return {
    confianca: p.ind_confianca,
    respeito: p.ind_respeito,
    seguranca: p.ind_seguranca,
    estresse: p.ind_estresse,
    engajamento: p.ind_engajamento,
    risco: p.ind_risco,
    xpModulo: p.xp_modulo,
    concluido: !!p.concluido,
  };
}

module.exports = { listarModulos, listarPerfis, iniciar, cenarioAtual, escolher };
