const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/RelatoriosController');

// Rotas para relatórios
router.get('/relatorios/diario', relatoriosController.relatorioDiario);
router.get('/relatorios/produtividade-colaborador', relatoriosController.produtividadeColaborador);
router.get('/relatorios/evolucao-temporal', relatoriosController.evolucaoTemporal);

module.exports = router;