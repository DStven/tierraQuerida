const { Router } = require('express');
const provProdController = require('../controllers/proveedorProductoController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('Administrador','Empleado'), provProdController.getAll);
router.post('/', roleMiddleware('Administrador'), provProdController.create);
router.delete('/:id', roleMiddleware('Administrador'), provProdController.remove);

module.exports = router;
