const router = require('express').Router();
import Post from '../models/post';

router.get('/', (req, res) => {
    const fetchPosts = Post.find().sort('meta.createdAt');

    fetchPosts
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

router.get('/slug=:slug', (req, res) => {
    const { slug } = req.params;

    const fetchPosts = Post.find({ slug: slug });

    fetchPosts
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

module.exports = router;