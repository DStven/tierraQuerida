const { Router } = require('express');
const rolController = require('../controllers/rolController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.get('/', authMiddleware, rolController.getAll);
router.get('/:id', authMiddleware, rolController.getById);
router.post('/', authMiddleware, rolController.create);
router.put('/:id', authMiddleware, rolController.update);
router.delete('/:id', authMiddleware, rolController.remove);

module.exports = router;
