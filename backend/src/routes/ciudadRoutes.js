const { Router } = require('express');
const ciudadController = require('../controllers/ciudadController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.get('/', authMiddleware, ciudadController.getAll);
router.get('/:id', authMiddleware, ciudadController.getById);
router.post('/', authMiddleware, ciudadController.create);
router.put('/:id', authMiddleware, ciudadController.update);
router.delete('/:id', authMiddleware, ciudadController.remove);

module.exports = router;
