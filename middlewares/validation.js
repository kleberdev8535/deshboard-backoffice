// Middleware de validação
const validarCampos = (campos) => {
  return (req, res, next) => {
    const erros = [];

    campos.forEach(campo => {
      if (!req.body[campo] && req.body[campo] !== 0) {
        erros.push(`${campo} é obrigatório`);
      }
    });

    if (erros.length > 0) {
      return res.status(400).json({ error: 'Dados inválidos', detalhes: erros });
    }

    next();
  };
};

// Middleware de tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Registro duplicado' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ error: 'Referência inválida' });
  }

  res.status(500).json({ error: 'Erro interno do servidor' });
};

// Middleware de logging
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

module.exports = {
  validarCampos,
  errorHandler,
  logger
};