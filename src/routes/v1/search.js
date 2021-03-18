const router = require('express').Router();
import Product from '../models/product';

router.get('/:text', ( req, res ) => {
    const text = req.params.text;
    const search = Product.find({ $text: { $search: text } });

    search.then( data => res.send(data) ).catch( err => res.send(err) );
});

module.exports = router;