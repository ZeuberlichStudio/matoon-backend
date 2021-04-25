const router = require('express').Router();
import OrdersController from '~/controllers/v2/orders-controller';
import authorize from '~/middleware/authorize';

router.post('/', OrdersController.create);

router.use(authorize(['admin']));
router.get('/', OrdersController.getList);
router.get('/:_id', OrdersController.getByID);
router.delete('/', OrdersController.removeMany);
router.delete('/:_id', OrdersController.remove);
router.put('/:_id', OrdersController.update);

module.exports = router;