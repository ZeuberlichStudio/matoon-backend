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

    if ( cat ) {
        match['$or'] = [
            { 'categories.slug': cat },
            { 'categories.ancestors': { $in: [cat] } }
        ];
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

    console.log(pipeline);

    //quering db
    const products = Product.aggregate(pipeline);


    products
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
        $unwind: {
            path: '$for',
            preserveNullAndEmptyArrays: true
        }
    });

    pipeline.push({
        $unwind: {
            path: '$materials',
            preserveNullAndEmptyArrays: true
        }
    });

    pipeline.push({
        $unwind: {
            path: '$colors'
        }
    });

    pipeline.push({
        $unwind: {
            path: '$brands'
        }
    });

    pipeline.push({
        $group: {
            _id: 'filters',
            sex: { 
                $addToSet: {
                    $cond: [
                        { $ne: [{ name: '$for'}, {}] },
                        { name: '$for'},
                        '$$REMOVE'
                    ]
                }
            },
            material: { 
                $addToSet: {
                    $cond: [
                        { $ne: [{ name: '$materials'}, {}] },
                        { name: '$materials'},
                        '$$REMOVE'
                    ]
                }
            },
            color: { $addToSet: '$colors' },
            brand: { 
                $addToSet: {
                    $cond: [
                        { $ne: [{ name: '$brands'}, {}] },
                        { name: '$brands'},
                        '$$REMOVE'
                    ]
                }
            }
        }
    });

    pipeline.push({
        $lookup: {
            from: 'colors',
            localField: 'color',
            foreignField: 'name',
            as: 'color'
        }
    });

    pipeline.push({
        $project: {  
            _id: 0, 
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