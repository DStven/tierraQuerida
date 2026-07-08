const { Router } = require('express');
const productoController = require('../controllers/productoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('Administrador','Empleado'), productoController.getAll);
router.get('/:id', roleMiddleware('Administrador','Empleado'), productoController.getById);
router.post('/', roleMiddleware('Administrador','Empleado'), productoController.create);
router.put('/:id', roleMiddleware('Administrador','Empleado'), productoController.update);
router.delete('/:id', roleMiddleware('Administrador'), productoController.remove);

module.exports = router;
