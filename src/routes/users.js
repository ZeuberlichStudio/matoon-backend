const router = require('express').Router();
const UsersController = require('../controllers/users-controller');
const authorize = require('../middleware/authorize');

router.post('/verify', UsersController.issueToken);

router.use(authorize(['admin']));
router.get('/', UsersController.getList);
router.get('/:_id', UsersController.getByID);
router.post('/', UsersController.create);

module.exports = router;