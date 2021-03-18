const router = require('express').Router();
import CatController from '~/controllers/v2/cats-controller';

router.get('/', CatController.getList);
router.get('/tree', CatController.getCatsTree);
router.get('/:_id', CatController.getByID);
router.post('/', CatController.create);
router.delete('/', CatController.removeMany);
router.delete('/:_id', CatController.remove);
router.put('/:_id', CatController.update);

module.exports = router;