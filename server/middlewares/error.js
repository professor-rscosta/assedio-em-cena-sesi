// Envolve handlers async para capturar rejeições e enviar ao errorHandler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Handler central de erros
function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error('[ERRO]', err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  // Erros conhecidos do MySQL
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Registro já existe (valor duplicado).' });
  }
  const status = err.status || 500;
  res.status(status).json({
    erro: err.publicMessage || 'Erro interno do servidor.',
  });
}

// 404 padrão
function notFound(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}

// Helper para lançar erros com status + mensagem pública
function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  e.publicMessage = message;
  return e;
}

module.exports = { asyncHandler, errorHandler, notFound, httpError };
