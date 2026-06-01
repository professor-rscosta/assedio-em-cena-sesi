const router = require('express').Router();
const { registrar, login, eu } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth');

router.post('/registrar', registrar);
router.post('/login', login);
router.get('/eu', autenticar, eu);

module.exports = router;
