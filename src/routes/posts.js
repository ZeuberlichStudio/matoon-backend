const router = require('express').Router();
const PostsController = require('../controllers/posts-controller');
const authorize = require('../middleware/authorize');

router.get('/', PostsController.getList);
router.get('/:_id', PostsController.getByID);

router.use(authorize(['admin']));
router.post('/', PostsController.create);
router.delete('/', PostsController.removeMany);
router.delete('/:_id', PostsController.remove);
router.put('/:_id', PostsController.update);

module.exports = router;