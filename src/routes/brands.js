const router = require('express').Router();
const BrandsController = require('../controllers/brands-controller');
const authorize = require('../middleware/authorize');

router.get('/', BrandsController.getList);
router.get('/:_id', BrandsController.getByID);

router.use(authorize(['admin']));
router.post('/', BrandsController.create);
router.delete('/', BrandsController.removeMany);
router.delete('/:_id', BrandsController.remove);
router.put('/:_id', BrandsController.update);

module.exports = router;