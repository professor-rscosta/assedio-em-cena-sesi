const router = require('express').Router();
const { autenticar } = require('../middlewares/auth');
const {
  listarModulos, listarPerfis, iniciar, cenarioAtual, escolher,
} = require('../controllers/jogo.controller');

router.use(autenticar);

router.get('/modulos', listarModulos);
router.get('/perfis', listarPerfis);
router.post('/modulos/:moduloId/iniciar', iniciar);
router.get('/modulos/:moduloId/cenario', cenarioAtual);
router.post('/modulos/:moduloId/escolher', escolher);

module.exports = router;
