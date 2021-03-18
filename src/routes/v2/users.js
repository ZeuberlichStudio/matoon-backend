const router = require('express').Router();
import UsersController from '~/controllers/v2/users-controller';
import authorize from '~/middleware/authorize';

router.post('/verify', UsersController.issueToken);
router.use(authorize(['admin']));
router.get('/', UsersController.getList);
router.get('/:_id', UsersController.getByID);
router.post('/', UsersController.create);

module.exports = router;