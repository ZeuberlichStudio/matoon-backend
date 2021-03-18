const devRouter = require('express').Router();
import Product from '../models/product';

devRouter.get('/', ( req, res ) => {
    Product.aggregate([
        {
            $match: {
                name: { 
                    $regex: /^(?=.*\bgucci\b)(?=.*\bwallet\b).*$/i
                }
            }
        }
    ])
        .then(data => res.send(data))
        .catch(err => res.send(err));
});

module.exports = devRouter;