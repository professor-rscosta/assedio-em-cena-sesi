const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { Ranking, Log } = require('../models');
const { SECRET } = require('../middlewares/auth');
const { asyncHandler, httpError } = require('../middlewares/error');

const ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;
const EXPIRES = process.env.JWT_EXPIRES || '7d';

function gerarToken(u) {
  return jwt.sign(
    { id: u.id, nome: u.nome, email: u.email, papel: u.papel_sistema },
    SECRET,
    { expiresIn: EXPIRES }
  );
}

const registrar = asyncHandler(async (req, res) => {
  const { nome, email, senha, cargo, departamento } = req.body;
  if (!nome || !email || !senha) throw httpError(400, 'Nome, e-mail e senha são obrigatórios.');
  if (senha.length < 6) throw httpError(400, 'A senha deve ter ao menos 6 caracteres.');

  const existe = await Usuario.porEmailComSenha(email);
  if (existe) throw httpError(409, 'Já existe uma conta com este e-mail.');

  const senha_hash = await bcrypt.hash(senha, ROUNDS);
  const user = await Usuario.criar({ nome, email, senha_hash, cargo, departamento });
  await Ranking.recalcular(user.id);
  await Log.registrar({ usuario_id: user.id, acao: 'registro', ip: req.ip });

  const token = gerarToken({ ...user, papel_sistema: user.papel_sistema });
  res.status(201).json({ token, usuario: user });
});

const login = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) throw httpError(400, 'Informe e-mail e senha.');

  const user = await Usuario.porEmailComSenha(email);
  if (!user || !user.ativo) throw httpError(401, 'Credenciais inválidas.');

  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok) throw httpError(401, 'Credenciais inválidas.');

  await Usuario.registrarAcesso(user.id);
  await Log.registrar({ usuario_id: user.id, acao: 'login', ip: req.ip });

  delete user.senha_hash;
  const token = gerarToken(user);
  res.json({ token, usuario: user });
});

const eu = asyncHandler(async (req, res) => {
  const user = await Usuario.porId(req.user.id);
  if (!user) throw httpError(404, 'Usuário não encontrado.');
  res.json({ usuario: user });
});

module.exports = { registrar, login, eu };
