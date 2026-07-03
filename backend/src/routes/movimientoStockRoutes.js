const { Router } = require('express');
const movimientoStockController = require('../controllers/movimientoStockController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

// Movimientos requiere usuario autenticado.
router.use(authMiddleware);

// Solo Administrador puede ver el historial.
router.get('/', roleMiddleware('Administrador'), movimientoStockController.getAll);
router.get('/:id', roleMiddleware('Administrador'), movimientoStockController.getById);

// Administrador y Empleado pueden registrar entradas y salidas.
router.post('/', roleMiddleware('Administrador', 'Empleado'), movimientoStockController.create);

module.exports = router;
