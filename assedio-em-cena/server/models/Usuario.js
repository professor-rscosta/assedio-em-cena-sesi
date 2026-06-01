const { query, queryOne } = require('../config/db');

const Usuario = {
  async criar({ nome, email, senha_hash, cargo = null, departamento = null, papel_sistema = 'colaborador' }) {
    const r = await query(
      `INSERT INTO usuarios (nome, email, senha_hash, cargo, departamento, papel_sistema)
       VALUES (:nome, :email, :senha_hash, :cargo, :departamento, :papel_sistema)`,
      { nome, email, senha_hash, cargo, departamento, papel_sistema }
    );
    return this.porId(r.insertId);
  },

  porId(id) {
    return queryOne(
      `SELECT id, nome, email, cargo, departamento, papel_sistema, avatar_url,
              nivel_maturidade, xp_total, ativo, ultimo_acesso, criado_em
       FROM usuarios WHERE id = :id`,
      { id }
    );
  },

  porEmailComSenha(email) {
    return queryOne(`SELECT * FROM usuarios WHERE email = :email`, { email });
  },

  listar({ limit = 50, offset = 0 } = {}) {
    return query(
      `SELECT id, nome, email, cargo, departamento, papel_sistema,
              nivel_maturidade, xp_total, ativo, ultimo_acesso, criado_em
       FROM usuarios ORDER BY criado_em DESC LIMIT :limit OFFSET :offset`,
      { limit: Number(limit), offset: Number(offset) }
    );
  },

  async atualizar(id, campos) {
    const permitidos = ['nome', 'cargo', 'departamento', 'papel_sistema', 'avatar_url', 'nivel_maturidade', 'ativo'];
    const sets = [];
    const params = { id };
    for (const k of permitidos) {
      if (campos[k] !== undefined) { sets.push(`${k} = :${k}`); params[k] = campos[k]; }
    }
    if (!sets.length) return this.porId(id);
    await query(`UPDATE usuarios SET ${sets.join(', ')} WHERE id = :id`, params);
    return this.porId(id);
  },

  async somarXp(id, xp) {
    await query(`UPDATE usuarios SET xp_total = xp_total + :xp WHERE id = :id`, { id, xp });
    return this.porId(id);
  },

  async definirMaturidade(id, nivel) {
    await query(`UPDATE usuarios SET nivel_maturidade = :nivel WHERE id = :id`, { id, nivel });
  },

  async registrarAcesso(id) {
    await query(`UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = :id`, { id });
  },

  async remover(id) {
    await query(`DELETE FROM usuarios WHERE id = :id`, { id });
  },
};

module.exports = Usuario;
