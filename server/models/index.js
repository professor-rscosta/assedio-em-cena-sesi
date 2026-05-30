const { query, queryOne } = require('../config/db');

const Badge = {
  listar() { return query(`SELECT * FROM badges ORDER BY xp_requerido`); },
  porChave(chave) { return queryOne(`SELECT * FROM badges WHERE chave = :chave`, { chave }); },

  doUsuario(usuarioId) {
    return query(
      `SELECT b.*, ub.conquistado_em
       FROM usuario_badges ub JOIN badges b ON b.id = ub.badge_id
       WHERE ub.usuario_id = :u ORDER BY ub.conquistado_em DESC`,
      { u: usuarioId }
    );
  },

  async conceder(usuarioId, badgeChave) {
    const badge = await this.porChave(badgeChave);
    if (!badge) return null;
    const r = await query(
      `INSERT IGNORE INTO usuario_badges (usuario_id, badge_id) VALUES (:u, :b)`,
      { u: usuarioId, b: badge.id }
    );
    return r.affectedRows > 0 ? badge : null; // null = já tinha
  },
};

const Ranking = {
  async recalcular(usuarioId) {
    await query(
      `INSERT INTO rankings (usuario_id, pontuacao, modulos_concluidos, badges_total)
       SELECT u.id,
              u.xp_total,
              (SELECT COUNT(*) FROM progresso p WHERE p.usuario_id=u.id AND p.concluido=TRUE),
              (SELECT COUNT(*) FROM usuario_badges ub WHERE ub.usuario_id=u.id)
       FROM usuarios u WHERE u.id = :u
       ON DUPLICATE KEY UPDATE
         pontuacao=VALUES(pontuacao),
         modulos_concluidos=VALUES(modulos_concluidos),
         badges_total=VALUES(badges_total)`,
      { u: usuarioId }
    );
  },

  top(limit = 20) {
    return query(
      `SELECT r.*, u.nome, u.avatar_url, u.nivel_maturidade
       FROM rankings r JOIN usuarios u ON u.id = r.usuario_id
       WHERE u.ativo = TRUE
       ORDER BY r.pontuacao DESC, r.modulos_concluidos DESC
       LIMIT :limit`,
      { limit: Number(limit) }
    );
  },
};

const Certificado = {
  criar({ usuario_id, codigo, nivel_maturidade, carga_horaria, badge_destaque, arquivo_url }) {
    return query(
      `INSERT INTO certificados
         (usuario_id, codigo, nivel_maturidade, carga_horaria, badge_destaque, arquivo_url)
       VALUES (:usuario_id, :codigo, :nivel_maturidade, :carga_horaria, :badge_destaque, :arquivo_url)`,
      { usuario_id, codigo, nivel_maturidade, carga_horaria, badge_destaque, arquivo_url }
    );
  },
  porCodigo(codigo) {
    return queryOne(
      `SELECT c.*, u.nome AS usuario_nome
       FROM certificados c JOIN usuarios u ON u.id = c.usuario_id
       WHERE c.codigo = :codigo`,
      { codigo }
    );
  },
  doUsuario(usuarioId) {
    return query(`SELECT * FROM certificados WHERE usuario_id = :u ORDER BY emitido_em DESC`, { u: usuarioId });
  },
};

const Analytics = {
  registrar({ usuario_id = null, evento, cenario_id = null, escolha_id = null, valor = null, metadata = null }) {
    return query(
      `INSERT INTO analytics (usuario_id, evento, cenario_id, escolha_id, valor, metadata)
       VALUES (:usuario_id, :evento, :cenario_id, :escolha_id, :valor, :metadata)`,
      { usuario_id, evento, cenario_id, escolha_id, valor, metadata: metadata ? JSON.stringify(metadata) : null }
    );
  },

  // métricas agregadas para o painel
  async resumo() {
    const totalUsuarios = (await queryOne(`SELECT COUNT(*) c FROM usuarios`)).c;
    const modulosConcluidos = (await queryOne(`SELECT COUNT(*) c FROM progresso WHERE concluido=TRUE`)).c;
    const certificados = (await queryOne(`SELECT COUNT(*) c FROM certificados`)).c;
    const escolhasPorEvento = await query(
      `SELECT evento, COUNT(*) total FROM analytics GROUP BY evento ORDER BY total DESC`
    );
    const distribMaturidade = await query(
      `SELECT nivel_maturidade nivel, COUNT(*) total FROM usuarios GROUP BY nivel_maturidade`
    );
    return { totalUsuarios, modulosConcluidos, certificados, escolhasPorEvento, distribMaturidade };
  },
};

const Log = {
  registrar({ usuario_id = null, acao, detalhe = null, ip = null }) {
    return query(
      `INSERT INTO logs (usuario_id, acao, detalhe, ip)
       VALUES (:usuario_id, :acao, :detalhe, :ip)`,
      { usuario_id, acao, detalhe: detalhe ? JSON.stringify(detalhe) : null, ip }
    );
  },
  listar({ limit = 100 } = {}) {
    return query(
      `SELECT l.*, u.nome AS usuario_nome FROM logs l
       LEFT JOIN usuarios u ON u.id = l.usuario_id
       ORDER BY l.criado_em DESC LIMIT :limit`,
      { limit: Number(limit) }
    );
  },
};

module.exports = { Badge, Ranking, Certificado, Analytics, Log };
