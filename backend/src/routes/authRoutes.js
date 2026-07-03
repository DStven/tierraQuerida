const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// Rutas publicas y protegidas de autenticacion.
router.post('/login', authController.login);
router.get('/refresh', authController.refreshToken);
router.get('/perfil', authMiddleware, authController.perfil);

module.exports = router;
