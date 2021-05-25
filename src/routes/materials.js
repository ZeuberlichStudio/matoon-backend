const router = require('express').Router();
const MaterialsController = require('../controllers/materials-controller');
const authorize = require('../middleware/authorize');

router.get('/', MaterialsController.getList);
router.get('/:_id', MaterialsController.getByID);

router.use(authorize(['admin']));
router.post('/', MaterialsController.create);
router.delete('/', MaterialsController.removeMany);
router.delete('/:_id', MaterialsController.remove);
router.put('/:_id', MaterialsController.update);

module.exports = router;