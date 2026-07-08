const { Router } = require('express');
const categoriaController = require('../controllers/categoriaController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();

router.get('/', authMiddleware, roleMiddleware('Administrador'), categoriaController.getAll);
router.get('/:id', authMiddleware, roleMiddleware('Administrador'), categoriaController.getById);
router.post('/', authMiddleware, roleMiddleware('Administrador'), categoriaController.create);
router.put('/:id', authMiddleware, roleMiddleware('Administrador'), categoriaController.update);
router.delete('/:id', authMiddleware, roleMiddleware('Administrador'), categoriaController.remove);

module.exports = router;
