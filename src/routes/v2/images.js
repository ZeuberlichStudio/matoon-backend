const router = require('express').Router();
import ImagesController from '~/controllers/v2/images-controller';
import authorize from '~/middleware/authorize';

router.use(authorize(['admin']));
router.get('/', ImagesController.getList);
router.get('/:_id', ImagesController.getByID);
router.post('/', ImagesController.create);
router.delete('/', ImagesController.removeMany);
router.delete('/:_id', ImagesController.remove);
router.put('/:_id', ImagesController.update);

module.exports = router;