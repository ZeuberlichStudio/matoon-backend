const router = require('express').Router();
import MaterialsController from '~/controllers/v2/materials-controller';

router.get('/', MaterialsController.getList);
router.get('/:_id', MaterialsController.getByID);
router.post('/', MaterialsController.create);
router.delete('/', MaterialsController.removeMany);
router.delete('/:_id', MaterialsController.remove);
router.put('/:_id', MaterialsController.update);

module.exports = router;