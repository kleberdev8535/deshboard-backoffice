const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/DashboardController');

// Rotas para dashboard
router.get('/dashboard/stats', dashboardController.getStats);
router.put('/dashboard/meta', dashboardController.updateMeta);
router.get('/dashboard/parciais', dashboardController.getParciais);
router.get('/dashboard/graficos', dashboardController.getGraficos);

module.exports = router;