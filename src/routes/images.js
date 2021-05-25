const router = require('express').Router();
const ImagesController = require('../controllers/images-controller');
const authorize = require('../middleware/authorize');

router.use(authorize(['admin']));
router.get('/', ImagesController.getList);
router.get('/:_id', ImagesController.getByID);
router.post('/', ImagesController.create);
router.delete('/', ImagesController.removeMany);
router.delete('/:_id', ImagesController.remove);
router.put('/:_id', ImagesController.update);

module.exports = router;