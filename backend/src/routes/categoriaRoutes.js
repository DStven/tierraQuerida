const { Router } = require('express');
const categoriaController = require('../controllers/categoriaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.get('/', authMiddleware, categoriaController.getAll);
router.get('/:id', authMiddleware, categoriaController.getById);
router.post('/', authMiddleware, categoriaController.create);
router.put('/:id', authMiddleware, categoriaController.update);
router.delete('/:id', authMiddleware, categoriaController.remove);

module.exports = router;
