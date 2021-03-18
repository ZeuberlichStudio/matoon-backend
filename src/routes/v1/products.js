const productsRouter = require('express').Router();

import Product from '../models/product';
import  _ from 'lodash';
import { getVariations, getVariationById } from 'controllers/products-controller';
import mongoose from 'mongoose';

productsRouter.get('/', ( req, res ) => {
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
        offset,
        attrMap = 'true',
        exc
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
    if ( exc ) {
        match['sku'] = { $ne: exc }; 
    }

    if ( minPrice && maxPrice ) {
        match['prices.0.amount'] = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
    }
    else if ( minPrice && !maxPrice ) {
        match['prices.0.amount'] = { $gte: parseInt(minPrice) };
    }
    else if ( !minPrice && maxPrice ) {
        match['prices.0.amount'] = { $lte: parseInt(maxPrice) };
    }

    if ( minStock ) {
        match['variations'] = { $elemMatch: { stock: { $gte: parseInt(minStock) } }};
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

    //searching by category
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

    //text search
    if ( search ) {
        
        const searchStrings = search.split(' ');
        const searchRegex = new RegExp( 
            '^' +
            searchStrings.reduce(( acc, next ) => {
                acc += `(?=.*${next}.*)`;
                return acc;
            }, '') +
            '.*$', 'i'
        );

        console.log('strings', searchStrings);
        console.log('regex', searchRegex);

        pipeline.push({
            $match: {
                $or: [
                    { name: { $regex: searchRegex } },
                    { desc: { $regex: searchRegex } },
                    { sku: { $regex: searchRegex } }
                ]
            }
        });
    }

    //joining variations
    pipeline.push({
        $lookup: {
            from: 'variations',
            localField: '_id',
            foreignField: 'parent',
            as: 'variations'
        }
    });

    //filters
    pipeline.push({
        $match: match
    });

    //adding attribute map 
    if ( attrMap === 'true' ) {
        pipeline.push({
            $unwind: {
                path: '$variations'
            }
        });

        pipeline.push({
            $lookup: {
                from: 'brands',
                localField: 'variations.brand',
                foreignField: 'slug',
                as: 'variations.brand'
            }
        });

        pipeline.push({
            $unwind: { 
                path: '$variations.brand',
                preserveNullAndEmptyArrays: true
            }
        })

        pipeline.push({
            $group: {
                _id: {
                    PRODUCT: '$$ROOT',
                    COLOR: '$variations.color' 
                },
                variations: { $push: '$variations' },
                attributeMap: { $push: '$variations' },
            }
        });

        pipeline.push({
            $project: {
                '_id.PRODUCT.variations': 0,
            }
        });

        pipeline.push({
            $lookup: {
                from: 'colors',
                localField: '_id.COLOR',
                foreignField: 'slug',
                as: '_id.COLOR'
            }
        });

        pipeline.push({
            $unwind: { path: '$_id.COLOR' }
        });

        pipeline.push({
            $unwind: { path: '$variations' }
        });

        pipeline.push({
            $sort: {
                '_id.COLOR.name': 1 
            }
        });

        pipeline.push({
            $group: {
                _id: {
                    PRODUCT: '$_id.PRODUCT',
                },
                variations: { $push: '$variations' },
                attributeMap: {
                    $push: {
                        k: '$_id.COLOR.slug',
                        v: {
                            name: '$_id.COLOR.name',
                            slug: '$_id.COLOR.slug',
                            value: '$_id.COLOR.value',
                            brands: '$attributeMap.brand'
                        } 
                    }
                },
            }
        });

        pipeline.push({
            $replaceRoot: {
                newRoot: { $mergeObjects: ['$_id.PRODUCT', {variations: '$variations', attributeMap: { $arrayToObject: '$attributeMap' }}] }
            }
        });
    } else {
        //join colors
        pipeline.push({
            $lookup: {
                from: 'colors',
                localField: 'attributes.colors',
                foreignField: 'slug',
                as: 'attributes.colors'
            }
        });
    }

    //removing categories
    pipeline.push({
        $project: {
            'categories': 0
        }
    });

    //sorting
    if ( sort ) {
        pipeline.push({
            $sort: sort
        });
    }

    //adding count and offset/limit
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
            $unwind: {
                path: '$count',
                preserveNullAndEmptyArrays: true
            },
        },
        {
            $project: {
                'totalMatches': { $ifNull: ['$count.value', 0] },
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

productsRouter.get('/id=:_id', (req, res) => {
    const { _id, attrMap } = req.params;

    const pipeline = [
        {
            $match: {
                _id: mongoose.Types.ObjectId(_id)
            }
        },
        {
            $lookup: {
                from: 'colors',
                localField: 'attributes.colors',
                foreignField: 'slug',
                as: 'attributes.colors'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'attributes.brands',
                foreignField: 'slug',
                as: 'attributes.brands'
            }
        }
    ];

    //adding attribute map 
    if ( attrMap === 'true' ) {        
        pipeline.push({
            $unwind: {
                path: '$variations'
            }
        });

        pipeline.push({
            $lookup: {
                from: 'brands',
                localField: 'variations.brand',
                foreignField: 'slug',
                as: 'variations.brand'
            }
        });

        pipeline.push({
            $unwind: { 
                path: '$variations.brand',
                preserveNullAndEmptyArrays: true
            }
        });

        pipeline.push({
            $group: {
                _id: {
                    PRODUCT: '$$ROOT',
                    COLOR: '$variations.color' 
                },
                variations: { $push: '$variations' },
                attributeMap: { $push: '$variations' },
            }
        });

        pipeline.push({
            $project: {
                '_id.PRODUCT.variations': 0,
            }
        });

        pipeline.push({
            $lookup: {
                from: 'colors',
                localField: '_id.COLOR',
                foreignField: 'slug',
                as: '_id.COLOR'
            }
        });

        pipeline.push({
            $unwind: { path: '$_id.COLOR' }
        });

        pipeline.push({
            $unwind: { path: '$variations' }
        });

        pipeline.push({
            $group: {
                _id: {
                    PRODUCT: '$_id.PRODUCT',
                },
                variations: { $push: '$variations' },
                attributeMap: {
                    $push: {
                        k: '$_id.COLOR.slug',
                        v: {
                            name: '$_id.COLOR.name',
                            slug: '$_id.COLOR.slug',
                            value: '$_id.COLOR.value',
                            brands: '$attributeMap.brand'
                        } 
                    }
                },
            }
        });

        pipeline.push({
            $replaceRoot: {
                newRoot: { $mergeObjects: ['$_id.PRODUCT', {variations: '$variations', attributeMap: { $arrayToObject: '$attributeMap' }}] }
            }
        });
    }

    const product = Product.aggregate(pipeline);

    product
        .then(data => {
            const sortedData = [];

            for( const doc of data ) {
                const index = slugs.indexOf(doc.slug);
                sortedData[index] = doc;
            }

            sortedData.reverse();

            res.send(sortedData);
        })
        .catch( err => res.send(err) );
});

productsRouter.get('/available-filters', (req, res) => {

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
            foreignField: 'slug',
            as: 'colors'
        }
    });

    pipeline.push({
        $lookup: {
            from: 'brands',
            localField: 'brands',
            foreignField: 'slug',
            as: 'brands'
        }
    });

    pipeline.push({
        $lookup: {
            from: 'materials',
            localField: 'materials',
            foreignField: 'slug',
            as: 'materials'
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
                        { $ifNull: ['$o.v.slug', false] },
                        '$o.v',
                        {
                            name: {
                                $switch: {
                                    branches: [
                                        { case: { $eq: ["$o.v", "male"] }, then: "Для него" },
                                        { case: { $eq: ["$o.v", "female"] }, then: "Для нее" },
                                        { case: { $eq: ["$o.v", "unisex"] }, then: "Унисекс" },
                                        { case: { $eq: ["$o.v", "kids"] }, then: "Для детей" },
                                    ],
                                    default: "unhandled"
                                }
                            },
                            slug: '$o.v'
                        }
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

    const filters = Product.aggregate(pipeline);

    filters
        .then( data => res.send(data[0]) )
        .catch( err => res.send(err) );
});

productsRouter.get('/variations', getVariations);
productsRouter.get('/variations/:_id', getVariationById);

productsRouter.post('/hook-test', (req, res, next) => console.log(JSON.stringify(req.body)));

module.exports = productsRouter;