const { Router } = require('express');
const auditoriaController = require('../controllers/auditoriaController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

// Solo administradores pueden ver y gestionar auditorias
router.get('/', roleMiddleware('Administrador'), auditoriaController.getAll);
router.get('/:id', roleMiddleware('Administrador'), auditoriaController.getById);

module.exports = router;
