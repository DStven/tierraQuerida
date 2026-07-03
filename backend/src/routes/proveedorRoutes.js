const { Router } = require('express');
const proveedorController = require('../controllers/proveedorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

// Proveedores requiere usuario autenticado.
router.use(authMiddleware);

// Administrador y Empleado pueden consultar proveedores.
router.get('/', roleMiddleware('Administrador', 'Empleado'), proveedorController.getAll);
router.get('/:id', roleMiddleware('Administrador', 'Empleado'), proveedorController.getById);

// Solo Administrador puede crear, editar o eliminar.
router.post('/', roleMiddleware('Administrador'), proveedorController.create);
router.put('/:id', roleMiddleware('Administrador'), proveedorController.update);
router.delete('/:id', roleMiddleware('Administrador'), proveedorController.remove);

module.exports = router;
