const router = require('express').Router();

import Product from '../database/models/product';
import Color from '../database/models/color';

router.get('/', (req, res) => {
    const {
        cat,
        sort: reqSort,
        color: reqColor,
        brand: reqBrand,
        material: reqMaterial,
        sex: reqSex,
        minPrice,
        maxPrice,
        minStock,
        search,
        limit,
        offset
    } = req.query;

    //sorting
    const sortField = reqSort && reqSort.split(',')[0];
    const sortDir = reqSort && reqSort.split(',')[1];

    //attributes
    const colors = reqColor && reqColor.split(',');
    const brands = reqBrand && reqBrand.split(',');
    const materials = reqMaterial && reqMaterial.split(',');
    const sex = reqSex && reqSex.split(',');

    //match stage
    let match = {};

    if ( colors ) {
        match['attributes.colors'] = { $in: colors };
    }
    if ( brands ) {
        match['attributes.brands'] = { $in: brands };
    }
    if ( materials ) {
        match['materials'] = { $in: materials };
    }
    if ( sex ) {
        match['for'] = { $in: sex };
    }

    if ( minPrice && maxPrice ) {
        match['price'] = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }
    else if ( minPrice && !maxPrice ) {
        match['price'] = { $gte: parseInt(minPrice) };
    }
    else if ( !minPrice && maxPrice ) {
        match['price'] = { $lte: parseInt(maxPrice) };
    }

    if ( minStock ) {
        match['meta.stock'] = { $gte: parseInt(minStock) };
    }

    //sort stage
    let sort = null;

    if ( sortField ) {
        sort = {
            [sortField]: sortDir ? parseInt(sortDir) : 1
        };
    }

    //pipeline
    let pipeline = [];

    if ( cat ) {
        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'categories',
                foreignField: 'slug',
                as: 'categories'
            }
        });

        pipeline.push({
            $match: {
                $or: [
                    { 'categories.slug': cat },
                    { 'categories.ancestors': { $in: [cat] } }
                ]
            }
        })
    }

    if ( search ) {
        
        const searchStrings = search.split(' ');
        const searchRegex = new RegExp( 
            '^' +
            searchStrings.reduce(( acc, next ) => {
                acc += `(?=.*\\b${next}.*\\b)`;
                return acc;
            }, '') +
            '.*$', 'i'
        );

        pipeline.push({
            $match: {
                $or: [
                    { name: { $regex: searchRegex } },
                    { description: { $regex: searchRegex } },
                    { sku: { $regex: searchRegex } }
                ]
            }
        });
    }

    pipeline.push({
        $match: match
    });

    pipeline.push({
        $lookup: {
            from: 'colors',
            localField: 'attributes.colors',
            foreignField: 'name',
            as: 'attributes.colors'
        }
    });

    pipeline.push({
        $project: {
            'categories': 0
        }
    });

    if ( sort ) {
        pipeline.push({
            $sort: sort
        });
    }

    pipeline.push(
        {
            $facet: {
                'count': [
                    { $count: 'value' }
                ],
                'rows': [
                    offset && {
                        $skip: parseInt(offset)
                    },
                    limit && {
                        $limit: parseInt(limit)
                    },
                    {
                        $match: {}
                    }
                ].filter(Boolean)
            },
        },
        {
            $unwind: '$count'
        },
        {
            $project: {
                'totalMatches': '$count.value',
                'rows': '$rows'
            }
        }
    )

    //quering db
    const products = Product.aggregate(pipeline);


    products
        .then( data => res.send(data[0]) )
        .catch( err => res.send(err) );
});

router.get('/slug=:slug', (req, res) => {
    const { slug } = req.params;
    const slugs = slug.split(',');

    const pipeline = [
        {
            $match: {
                slug: { $in: slugs }
            }
        },
        {
            $lookup: {
                from: 'colors',
                localField: 'attributes.colors',
                foreignField: 'name',
                as: 'attributes.colors'
            }
        }
    ];

    const product = Product.aggregate(pipeline);

    product
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

router.get('/available-filters', (req, res) => {

    const {
        cat,
        minPrice,
        maxPrice,
        minStock
    } = req.query;

    //match

    let match = {};

    if ( cat ) {
        match['$or'] = [
            { 'categories.slug': cat },
            { 'categories.ancestors': { $in: [cat] } }
        ];
    }

    if ( minPrice && maxPrice ) {
        match['price'] = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }
    else if ( minPrice && !maxPrice ) {
        match['price'] = { $gte: parseInt(minPrice) };
    }
    else if ( !minPrice && maxPrice ) {
        match['price'] = { $lte: parseInt(maxPrice) };
    }

    if ( minStock ) {
        match['meta.stock'] = { $gte: parseInt(minStock) };
    }

    //pipeline

    let pipeline = [];

    if ( cat ) {
        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'categories',
                foreignField: 'slug',
                as: 'categories'
            }
        });
    }

    pipeline.push({
        $match: match
    });

    pipeline.push({
        $project: {
            _id: 0,
            for: 1,
            materials: 1,
            colors: '$attributes.colors',
            brands: '$attributes.brands'
        }
    });

    pipeline.push({
        $lookup: {
            from: 'colors',
            localField: 'colors',
            foreignField: 'name',
            as: 'colors'
        }
    });

    pipeline.push({
        $project: {
            'o': { $objectToArray: '$$ROOT' }
        }
    });

    pipeline.push({
        $unwind: {
            path: '$o',
            preserveNullAndEmptyArrays: true
        }
    });

    pipeline.push({
        $unwind: {
            path: '$o.v',
            preserveNullAndEmptyArrays: true
        }
    });

    pipeline.push({
        $group: {
            _id: '$o.k',
            rows: { 
                $addToSet: {
                    $cond: [
                        { $ifNull: ['$o.v.name', false] },
                        '$o.v',
                        { name: '$o.v' }
                    ]
                }
            }
        }
    });

    pipeline.push({
        $unwind: {
            path: '$rows',
        }
    });

    pipeline.push({
        $sort: {
            'rows.name': 1,
        }
    });

    // pipeline.push({
    //     $group: {
    //         _id: {
    //             $cond: [
    //                 { $eq: ['$_id', 'for'] },
    //                 'sex',
    //                 '$_id'
    //             ],
    //         },
    //         rows: { $push: '$rows' }
    //     }
    // });
    
    pipeline.push({
        $group: {
            _id: 'available_filters',
            sex: {
                $push: {
                    $cond: [
                        { $eq: ['$_id', 'for'] },
                        '$rows',
                        '$$REMOVE'
                    ],
                }
            },
            colors: {
                $push: {
                    $cond: [
                        { $eq: ['$_id', 'colors'] },
                        '$rows',
                        '$$REMOVE'
                    ],
                }
            },
            materials: {
                $push: {
                    $cond: [
                        { $eq: ['$_id', 'materials'] },
                        '$rows',
                        '$$REMOVE'
                    ],
                }
            },
            brands: {
                $push: {
                    $cond: [
                        { $eq: ['$_id', 'brands'] },
                        '$rows',
                        '$$REMOVE'
                    ],
                }
            },
        }
    });

    pipeline.push({
        $project: {  
            'color.__v': 0,
            'color._id': 0
        }
    });

    console.log(pipeline)

    const filters = Product.aggregate(pipeline);

    filters
        .then( data => res.send(data[0]) )
        .catch( err => res.send(err) );
});

module.exports = router;