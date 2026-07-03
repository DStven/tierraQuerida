const { Router } = require('express');
const departamentoController = require('../controllers/departamentoController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.get('/', authMiddleware, departamentoController.getAll);
router.get('/:id', authMiddleware, departamentoController.getById);
router.post('/', authMiddleware, departamentoController.create);
router.put('/:id', authMiddleware, departamentoController.update);
router.delete('/:id', authMiddleware, departamentoController.remove);

module.exports = router;
