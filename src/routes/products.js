const router = require('express').Router();

import Product from '../database/models/product';

router.get('/', (req, res) => {
    const where = req.query.name && {
        name: req.query.name.slice(","),
    }

    const sort = req.query.sort && { [req.query.sort.split(",")[0]]: req.query.sort.split(",")[1] };

    Product.find(where && where)
        .sort(sort && sort)
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});


module.exports = router;