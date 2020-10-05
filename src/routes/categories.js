const router = require('express').Router();

import Cat from '../database/models/cat';

router.get('/:slug', (req, res) => {
    const catSlug = req.params.slug;

    const getCategory = Cat
        .find({ slug: catSlug })
        .populate('ancestors');

    getCategory
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

module.exports = router;