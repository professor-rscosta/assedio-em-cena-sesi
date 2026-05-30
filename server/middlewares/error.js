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
  // Schema desatualizado (tabela/coluna que o código novo espera não existe ainda)
  if (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR') {
    console.error('[ERRO] Banco desatualizado. Rode: npm run db:migrate (ou npm run db:init && npm run seed).');
    return res.status(500).json({
      erro: 'Banco de dados desatualizado. Rode "npm run db:migrate" no servidor para aplicar as mudanças.',
    });
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
