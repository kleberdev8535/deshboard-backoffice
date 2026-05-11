const express = require('express');
const router = express.Router();
const controller = require('../controllers/produtividadeController');

router.get('/', controller.listarRegistros);
router.post('/', controller.criarRegistro);

module.exports = router;
