const router = require('express').Router();
import ImagesController from '~/controllers/v2/images-controller';

router.get('/', ImagesController.getList);
router.get('/:_id', ImagesController.getByID);
router.post('/', ImagesController.create);
router.delete('/', ImagesController.removeMany);
router.delete('/:_id', ImagesController.remove);
router.put('/:_id', ImagesController.update);

module.exports = router;