const router = require('express').Router();
const ColorController = require('../controllers/colors-controller');
const authorize = require('../middleware/authorize');

router.get('/', ColorController.getList);
router.get('/:_id', ColorController.getByID);

router.use(authorize(['admin']));
router.post('/', ColorController.create);
router.delete('/', ColorController.removeMany);
router.delete('/:_id', ColorController.remove);
router.put('/:_id', ColorController.update);

module.exports = router;