const Usuario = require('../models/Usuario');
const Jogo = require('../models/Jogo');
const { Badge, Ranking, Certificado, Analytics, Log } = require('../models');
const { gerarCertificado, gerarRelatorioRespostas } = require('../services/certificado.service');
const { notificarCertificado } = require('../services/email.service');
const { asyncHandler, httpError } = require('../middlewares/error');

// perfis "femininos" usam a personagem Bia no certificado
const PERFIL_PERSONAGEM = { rh: 'bia', vitima: 'bia' };

// ---------- Gamificação ----------
const meusBadges = asyncHandler(async (req, res) => {
  const [todos, meus] = await Promise.all([Badge.listar(), Badge.doUsuario(req.user.id)]);
  const conquistados = new Set(meus.map((b) => b.id));
  res.json({
    badges: todos.map((b) => ({ ...b, conquistado: conquistados.has(b.id) })),
  });
});

const ranking = asyncHandler(async (req, res) => {
  res.json({ ranking: await Ranking.top(Number(req.query.limit) || 20) });
});

// ---------- Certificado ----------
const emitirCertificado = asyncHandler(async (req, res) => {
  const moduloId = Number(req.params.moduloId);
  const progresso = await Jogo.progresso(req.user.id, moduloId);
  if (!progresso || !progresso.concluido) {
    throw httpError(400, 'Conclua o módulo antes de emitir o certificado.');
  }
  const modulo = await Jogo.modulo(moduloId);
  const user = await Usuario.porId(req.user.id);
  const meus = await Badge.doUsuario(req.user.id);
  const badgeDestaque = meus.length ? meus[0].nome : null;

  // personagem do certificado conforme o perfil jogado
  let personagem = 'teo';
  if (progresso.perfil_id) {
    const perfis = await Jogo.listarPerfis();
    const p = perfis.find((x) => x.id === progresso.perfil_id);
    if (p && PERFIL_PERSONAGEM[p.chave]) personagem = PERFIL_PERSONAGEM[p.chave];
  }

  const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
  const { codigo, arquivoUrl } = await gerarCertificado({
    nome: user.nome,
    nivelMaturidade: user.nivel_maturidade,
    cargaHoraria: modulo.carga_horaria,
    badgeDestaque, personagem,
    baseUrl,
  });

  await Certificado.criar({
    usuario_id: user.id, codigo,
    nivel_maturidade: user.nivel_maturidade,
    carga_horaria: modulo.carga_horaria,
    badge_destaque: badgeDestaque, arquivo_url: arquivoUrl,
  });
  await Log.registrar({ usuario_id: user.id, acao: 'certificado_emitido', detalhe: { codigo }, ip: req.ip });
  notificarCertificado({ para: user.email, nome: user.nome, codigo, baseUrl }).catch(() => {});

  res.status(201).json({ codigo, arquivoUrl });
});

// ---------- Relatório de respostas (PDF separado) ----------
const exportarRespostas = asyncHandler(async (req, res) => {
  const moduloId = Number(req.params.moduloId);
  const user = await Usuario.porId(req.user.id);
  const respostas = await Jogo.respostasDoUsuario(req.user.id, moduloId);
  if (!respostas.length) throw httpError(400, 'Nenhuma resposta registrada para este módulo.');

  const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
  const { arquivoUrl } = await gerarRelatorioRespostas({
    nome: user.nome, nivelMaturidade: user.nivel_maturidade, respostas, baseUrl,
  });
  await Log.registrar({ usuario_id: user.id, acao: 'respostas_exportadas', detalhe: { moduloId }, ip: req.ip });
  res.status(201).json({ arquivoUrl });
});

const validarCertificado = asyncHandler(async (req, res) => {
  const cert = await Certificado.porCodigo(req.params.codigo);
  if (!cert) throw httpError(404, 'Certificado não encontrado ou inválido.');
  res.json({
    valido: true,
    nome: cert.usuario_nome,
    nivel: cert.nivel_maturidade,
    cargaHoraria: cert.carga_horaria,
    emitidoEm: cert.emitido_em,
  });
});

// ---------- Admin ----------
const adminUsuarios = asyncHandler(async (req, res) => {
  res.json({ usuarios: await Usuario.listar({ limit: req.query.limit, offset: req.query.offset }) });
});

const adminAtualizarUsuario = asyncHandler(async (req, res) => {
  const user = await Usuario.atualizar(Number(req.params.id), req.body);
  if (!user) throw httpError(404, 'Usuário não encontrado.');
  res.json({ usuario: user });
});

const adminRemoverUsuario = asyncHandler(async (req, res) => {
  await Usuario.remover(Number(req.params.id));
  res.json({ ok: true });
});

const adminAnalytics = asyncHandler(async (req, res) => {
  res.json({ analytics: await Analytics.resumo() });
});

const adminLogs = asyncHandler(async (req, res) => {
  res.json({ logs: await Log.listar({ limit: req.query.limit }) });
});

module.exports = {
  meusBadges, ranking,
  emitirCertificado, exportarRespostas, validarCertificado,
  adminUsuarios, adminAtualizarUsuario, adminRemoverUsuario, adminAnalytics, adminLogs,
};
