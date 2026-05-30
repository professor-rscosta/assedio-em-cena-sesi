const { query, queryOne } = require('../config/db');

const Jogo = {
  // ---------- Catálogo ----------
  listarModulos() {
    return query(`SELECT * FROM modulos WHERE ativo = TRUE ORDER BY ordem`);
  },

  modulo(id) {
    return queryOne(`SELECT * FROM modulos WHERE id = :id`, { id });
  },

  listarPerfis() {
    return query(`SELECT * FROM perfis ORDER BY id`);
  },

  cenarioInicial(moduloId) {
    return queryOne(
      `SELECT * FROM cenarios WHERE modulo_id = :moduloId AND cenario_inicial = TRUE LIMIT 1`,
      { moduloId }
    );
  },

  async cenarioComEscolhas(cenarioId) {
    const cenario = await queryOne(
      `SELECT c.*, p.nome AS personagem_nome, p.cor_tema AS personagem_cor, p.sprite_url
       FROM cenarios c LEFT JOIN personagens p ON p.id = c.personagem_id
       WHERE c.id = :id`,
      { id: cenarioId }
    );
    if (!cenario) return null;
    const escolhas = await query(
      `SELECT id, texto, cenario_destino_id, correta, ordem
       FROM escolhas WHERE cenario_id = :id ORDER BY ordem`,
      { id: cenarioId }
    );
    return { ...cenario, escolhas };
  },

  escolha(id) {
    return queryOne(`SELECT * FROM escolhas WHERE id = :id`, { id });
  },

  consequenciaDaEscolha(escolhaId) {
    return queryOne(`SELECT * FROM consequencias WHERE escolha_id = :id LIMIT 1`, { id: escolhaId });
  },

  // ---------- Progresso ----------
  progresso(usuarioId, moduloId) {
    return queryOne(
      `SELECT * FROM progresso WHERE usuario_id = :u AND modulo_id = :m`,
      { u: usuarioId, m: moduloId }
    );
  },

  async iniciarProgresso(usuarioId, moduloId, perfilId, cenarioInicialId) {
    await query(
      `INSERT INTO progresso (usuario_id, modulo_id, perfil_id, cenario_atual_id)
       VALUES (:u, :m, :p, :c)
       ON DUPLICATE KEY UPDATE
         perfil_id = VALUES(perfil_id),
         cenario_atual_id = VALUES(cenario_atual_id),
         concluido = FALSE,
         ind_confianca=50, ind_respeito=50, ind_seguranca=50,
         ind_estresse=30, ind_engajamento=50, ind_risco=30,
         xp_modulo=0, concluido_em=NULL, iniciado_em=NOW()`,
      { u: usuarioId, m: moduloId, p: perfilId, c: cenarioInicialId }
    );
    return this.progresso(usuarioId, moduloId);
  },

  async aplicarEscolha(usuarioId, moduloId, escolha) {
    const clamp = (v) => Math.max(0, Math.min(100, v));
    const p = await this.progresso(usuarioId, moduloId);
    if (!p) return null;

    const novo = {
      ind_confianca:   clamp(p.ind_confianca   + escolha.delta_confianca),
      ind_respeito:    clamp(p.ind_respeito    + escolha.delta_respeito),
      ind_seguranca:   clamp(p.ind_seguranca   + escolha.delta_seguranca),
      ind_estresse:    clamp(p.ind_estresse    + escolha.delta_estresse),
      ind_engajamento: clamp(p.ind_engajamento + escolha.delta_engajamento),
      ind_risco:       clamp(p.ind_risco       + escolha.delta_risco),
      xp_modulo:       p.xp_modulo + escolha.xp,
      cenario_atual_id: escolha.cenario_destino_id,
    };

    await query(
      `UPDATE progresso SET
         ind_confianca=:ind_confianca, ind_respeito=:ind_respeito,
         ind_seguranca=:ind_seguranca, ind_estresse=:ind_estresse,
         ind_engajamento=:ind_engajamento, ind_risco=:ind_risco,
         xp_modulo=:xp_modulo, cenario_atual_id=:cenario_atual_id
       WHERE usuario_id=:u AND modulo_id=:m`,
      { ...novo, u: usuarioId, m: moduloId }
    );
    return this.progresso(usuarioId, moduloId);
  },

  async concluirModulo(usuarioId, moduloId) {
    await query(
      `UPDATE progresso SET concluido = TRUE, concluido_em = NOW()
       WHERE usuario_id = :u AND modulo_id = :m`,
      { u: usuarioId, m: moduloId }
    );
    return this.progresso(usuarioId, moduloId);
  },

  progressoDoUsuario(usuarioId) {
    return query(
      `SELECT pr.*, m.titulo AS modulo_titulo, m.carga_horaria
       FROM progresso pr JOIN modulos m ON m.id = pr.modulo_id
       WHERE pr.usuario_id = :u ORDER BY m.ordem`,
      { u: usuarioId }
    );
  },
};

module.exports = Jogo;
