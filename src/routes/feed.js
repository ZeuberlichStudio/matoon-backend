const router = require('express').Router();
import Post from '../database/models/post';

router.get('/', (req, res) => {
    const fetchPosts = Post.find().sort('meta.createdAt');

    fetchPosts
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

module.exports = router;