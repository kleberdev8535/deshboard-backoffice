const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/ColaboradorController');
const { validarCampos } = require('../middlewares/validation');

// Rotas para colaboradores
router.get('/colaboradores', colaboradorController.index);
router.get('/colaboradores/:id', colaboradorController.show);
router.post('/colaboradores', validarCampos(['nome']), colaboradorController.store);
router.put('/colaboradores/:id', validarCampos(['nome']), colaboradorController.update);
router.delete('/colaboradores/:id', colaboradorController.delete);

module.exports = router;