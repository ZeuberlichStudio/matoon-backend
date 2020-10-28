const router = require('express').Router();

import Cat from '../database/models/cat';

router.get('/', (req, res) => {
    const pipeline = [
        {
            $match: { parent: { $exists: true } }
        },
        {
            $project: {
                _id: 0,
                posts: 0
            }
        },
        {
            $group: {
                _id: '$parent',
                children: { $push: '$$ROOT' }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'slug',
                as: '_id'
            }
        },
        {
            $unwind: {
                path: '$_id'
            }
        },
        {
            $project: {
                name: '$_id.name',
                slug: '$_id.slug',
                name: '$_id.name',
                parent: '$_id.parent',
                ancestors: '$_id.ancestors',
                _id: 0,
                children: '$children',

            }
        },
        {
            $group: {
                _id: '$parent',
                children: { $push: '$$ROOT' }
            }
        },
        {
            $match: { _id: { $ne: null } }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: 'slug',
                as: '_id'
            }
        },
        {
            $unwind: {
                path: '$_id'
            }
        },
        {
            $project: {
                name: '$_id.name',
                slug: '$_id.slug',
                name: '$_id.name',
                parent: '$_id.parent',
                ancestors: '$_id.ancestors',
                _id: 0,
                children: '$children',

            }
        }
    ];

    const getCatTree = Cat.aggregate(pipeline);

    getCatTree
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

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