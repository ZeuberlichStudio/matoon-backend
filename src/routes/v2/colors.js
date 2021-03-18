const router = require('express').Router();
import ColorController from '~/controllers/v2/colors-controller';

router.get('/', ColorController.getList);
router.get('/:_id', ColorController.getByID);
router.post('/', ColorController.create);
router.delete('/', ColorController.removeMany);
router.delete('/:_id', ColorController.remove);
router.put('/:_id', ColorController.update);

module.exports = router;