const router = require('express').Router();

import Product from '../database/models/product';
import Color from '../database/models/color';

router.get('/', (req, res) => {
    const where = req.query.name && {
        name: req.query.name.slice(","),
    }

    const sort = req.query.sort && { [req.query.sort.split(",")[0]]: req.query.sort.split(",")[1] };

    Product.aggregate([
            {
                $lookup: {
                    from: Color.collection.name,
                    localField: 'attributes.colors',
                    foreignField: 'name',
                    as: 'attributes.colors'
                }
            },
            {
                $sort: sort || {
                    'meta.createdAt': -1
                }
            }
        ])
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

router.get('/:cat_slug', (req, res) => {
    const cat_slug = req.params.cat_slug;

    const result = Product.aggregate([
        {
            $lookup: {
                from: 'categories',
                localField: 'categories',
                foreignField: 'slug',
                as: 'categories'
            }
        },
        {
            $unwind: {
                path: '$categories'
            }
        },
        {
            $match: {
                $or: [
                    { 'categories.slug': cat_slug },
                    { 'categories.ancestors': { $in: [cat_slug] } }
                ] 
            }
        },
        {
            $project: {
                categories: 0
            }
        },
        {
            $group: {
                _id: '_id',
                rows: {$addToSet: '$$ROOT' }
            }
        }
    ])

    result
        .then( (data) => res.send(data[0].rows) )
        .catch( err => res.send(err) );
});

router.get('/available-filters', (req, res) => {
    const filterIds = 
    Product.aggregate([
        {
            $unwind: '$attributes'
        },
        {
            $unwind: '$attributes.colors'
        },
        {
            $unwind: '$attributes.brands'
        },
        { 
            $group: {
                _id: 0,
               colors: {$addToSet: '$attributes.colors'},
               brands: {$addToSet: {
                   "name": '$attributes.brands'
               }}
            }
        },
        {
            $lookup: {
                from: Color.collection.name,
                localField: 'colors',
                foreignField: 'name',
                as: 'colors'
            }
        },
        {   
            $project: {
                "_id": 0
            }
        }
    ]);

    filterIds
        .then( data => res.send(data[0]) )
        .catch( err => res.send(err) )
});

module.exports = router;