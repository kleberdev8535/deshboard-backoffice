require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./src/database/connection');
const { errorHandler, logger } = require('./src/middlewares/validation');

// Importar rotas
const colaboradoresRoutes = require('./src/routes/colaboradores');
const produtividadeRoutes = require('./src/routes/produtividade');
const dashboardRoutes = require('./src/routes/dashboard');
const relatoriosRoutes = require('./src/routes/relatorios');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger);

// Rotas da API
app.use('/api', colaboradoresRoutes);
app.use('/api', produtividadeRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', relatoriosRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();
