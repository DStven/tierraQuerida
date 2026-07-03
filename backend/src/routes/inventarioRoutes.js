const { Router } = require('express');
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

// El inventario requiere usuario autenticado.
router.use(authMiddleware);

// Administrador y Empleado pueden consultar.
router.get('/', roleMiddleware('Administrador', 'Empleado'), inventarioController.getAll);
router.get('/:id', roleMiddleware('Administrador', 'Empleado'), inventarioController.getById);

// Solo Administrador puede modificar inventario directamente.
router.post('/', roleMiddleware('Administrador'), inventarioController.create);
router.put('/:id', roleMiddleware('Administrador'), inventarioController.update);
router.delete('/:id', roleMiddleware('Administrador'), inventarioController.remove);

module.exports = router;
