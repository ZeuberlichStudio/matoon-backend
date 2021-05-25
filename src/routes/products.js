const router = require('express').Router();
const ProductsController = require('../controllers/products-controller');
const authorize = require('../middleware/authorize');

router.use(authorize(['guest', 'user', 'admin']));
router.get('/', ProductsController.getList);
router.get('/filters', ProductsController.getFilters);
router.get('/:_id', ProductsController.getByID);

router.use(authorize(['admin']));
router.post('/', ProductsController.create);
router.delete('/', ProductsController.removeMany);
router.delete('/:_id', ProductsController.remove);
router.put('/:_id', ProductsController.update);

module.exports = router;