const router = require('express').Router();
const CatController = require('../controllers/cats-controller');
const authorize = require('../middleware/authorize');

router.get('/', CatController.getList);
router.get('/tree', CatController.getCatsTree);
router.get('/:_id', CatController.getByID);

router.use(authorize(['admin']));
router.post('/', CatController.create);
router.delete('/', CatController.removeMany);
router.delete('/:_id', CatController.remove);
router.put('/:_id', CatController.update);

module.exports = router;