const router = require('express').Router();
import ProductsController from '~/controllers/v2/products-controller';

router.get('/', ProductsController.getList);
router.get('/filters', ProductsController.getFilters);
router.get('/:_id', ProductsController.getByID);
router.post('/', ProductsController.create);
router.delete('/', ProductsController.removeMany);
router.delete('/:_id', ProductsController.remove);
router.put('/:_id', ProductsController.update);

module.exports = router;