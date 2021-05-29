const router = require('express').Router();
const ImageController = require('../controllers/image.controller');
const uploadFiles = require('../middleware/fileUpload');
const authorize = require('../middleware/authorize');

router.use(authorize(['admin']));
router.get('/:_id', ImageController.getImageRecord);
router.get('/', ImageController.getImageRecordsList);
router.post('/', uploadFiles, ImageController.createImage);
router.delete('/:_id', ImageController.deleteImage);

module.exports = router;