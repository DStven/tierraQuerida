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

// Administrador y Empleado pueden crear y editar inventario.
router.post('/', roleMiddleware('Administrador', 'Empleado'), inventarioController.create);
router.put('/:id', roleMiddleware('Administrador', 'Empleado'), inventarioController.update);
// Solo Administrador puede eliminar inventario.
router.delete('/:id', roleMiddleware('Administrador'), inventarioController.remove);

module.exports = router;
