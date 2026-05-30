const router = require('express').Router();
const { autenticar, autorizar } = require('../middlewares/auth');
const c = require('../controllers/admin.controller');

// --- Gamificação (qualquer usuário logado) ---
router.get('/badges', autenticar, c.meusBadges);
router.get('/ranking', autenticar, c.ranking);

// --- Certificados ---
router.post('/certificados/modulos/:moduloId', autenticar, c.emitirCertificado);
router.get('/certificados/validar/:codigo', c.validarCertificado); // público

// --- Admin / RH ---
router.get('/admin/usuarios', autenticar, autorizar('admin', 'rh'), c.adminUsuarios);
router.put('/admin/usuarios/:id', autenticar, autorizar('admin'), c.adminAtualizarUsuario);
router.delete('/admin/usuarios/:id', autenticar, autorizar('admin'), c.adminRemoverUsuario);
router.get('/admin/analytics', autenticar, autorizar('admin', 'rh'), c.adminAnalytics);
router.get('/admin/logs', autenticar, autorizar('admin'), c.adminLogs);

module.exports = router;
