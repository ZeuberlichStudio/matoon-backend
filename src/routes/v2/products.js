const router = require('express').Router();
import ProductsController from '~/controllers/v2/products-controller';
import authorize from '~/middleware/authorize';

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