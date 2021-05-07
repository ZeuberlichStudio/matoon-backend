const router = require('express').Router();
const {
    getImageRecord,
    getImageRecordsList,
    uploadImages,
    createImageRecords,
    deleteImage,
    // deleteImageRecord
} = require('~/controllers/image.controller');

router.get('/:_id', getImageRecord);
router.get('/', getImageRecordsList);
router.post('/', uploadImages, createImageRecords);
// router.delete('/:_id', deleteImage);

module.exports = router;