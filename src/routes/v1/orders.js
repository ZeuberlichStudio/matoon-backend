const router = require('express').Router();
import { getOrder, postOrder, messageOrder } from '../controllers/order-controller';

router.post('/', postOrder, messageOrder );
router.get('/:id', getOrder );

module.exports = router;