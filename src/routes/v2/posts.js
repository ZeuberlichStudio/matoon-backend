const router = require('express').Router();
import PostsController from '~/controllers/v2/posts-controller';

router.get('/', PostsController.getList);
router.get('/:_id', PostsController.getByID);
router.post('/', PostsController.create);
router.delete('/', PostsController.removeMany);
router.delete('/:_id', PostsController.remove);
router.put('/:_id', PostsController.update);

module.exports = router;