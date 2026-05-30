const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

// Verifica token Bearer e injeta req.user
function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Token ausente. Faça login.' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { id, nome, email, papel }
    next();
  } catch (e) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Restringe acesso a determinados papéis. Ex: autorizar('admin','rh')
function autorizar(...papeis) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }
    if (papeis.length && !papeis.includes(req.user.papel)) {
      return res.status(403).json({ erro: 'Acesso negado para o seu perfil.' });
    }
    next();
  };
}

module.exports = { autenticar, autorizar, SECRET };
