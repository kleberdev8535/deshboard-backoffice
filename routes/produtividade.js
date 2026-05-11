const express = require('express');
const router = express.Router();
const produtividadeController = require('../controllers/ProdutividadeController');
const { validarCampos } = require('../middlewares/validation');

// Rotas para produtividade
router.get('/produtividade', produtividadeController.index);
router.get('/produtividade/:id', produtividadeController.show);
router.post('/produtividade', validarCampos(['colaborador_id', 'data']), produtividadeController.store);
router.put('/produtividade/:id', produtividadeController.update);
router.delete('/produtividade/:id', produtividadeController.delete);

module.exports = router;