import Product from '~/models/v2/product';
import { Types } from 'mongoose';

module.exports = {
    //TODO!!! добавить сортировку по нескольким полям
    getList(req, res, next) {
        //Initial category lookup
        const catLookup = {
            from: 'cats',
            localField: 'cat',
            foreignField: '_id',
            as: 'cat'
        }
    
        const parentCatLookup = {
            from: 'cats',
            localField: 'cat.parent',
            foreignField: '_id',
            as: 'cat.parent'
        }
    
        //Basic filtering
        const filters = {$and: []}

        //Return unpublished products only if user is admin
        if ( req.user.role !== 'admin' ) {
            filters.isPublished = true;
        }

        //Exclude documents
        if ( req.query.exc ) {
            filters._id = { $ne: Types.ObjectId(req.query.exc) }
        }
    
        //Filter by category id
        if ( req.query.catId ) {
            const {catId} = req.query;
    
            filters['$and'].push({
                $or: [
                    {"cat._id": Types.ObjectId(catId)},
                    {"cat.parent._id": Types.ObjectId(catId)}
                ]
            });
        }
    
        //Filter by category slug
        if ( req.query.catSlug ) {
            const {catSlug} = req.query;
    
            filters['$and'].push({
                $or: [
                    {"cat.slug": catSlug},
                    {"cat.parent.slug": catSlug}
                ]
            })
        }

        //Filter by search string
        if ( req.query.search ) {
            const searchStrings = req.query.search.split('%20');

            const searchRegex = new RegExp( 
                '^' +
                searchStrings.reduce(( acc, next ) => {
                    acc += `(?=.*${next}.*)`;
                    return acc;
                }, '') +
                '.*$', 'i'
            );

            filters['$and'].push({
                $or: [
                    { name: { $regex: searchRegex } },
                    { desc: { $regex: searchRegex } },
                    { sku: { $regex: searchRegex } },
                    { 'cat.name': { $regex: searchRegex } }
                ]
            });
        }

        if ( filters['$and'].length === 0 ) delete filters['$and'];

        //Filter by document id
        if ( req.query.id ) {
            const IDs = req.query.id.split(',');
            
            filters['_id'] = { $in: IDs.map(id => Types.ObjectId(id)) };
        }        
    
        //Filter by ids of a variants color attribute
        if ( req.query.color ) { 
            const colorIDs = req.query.color.split(',');
            filters['variants.attributes.color'] = { $in: colorIDs.map(id => Types.ObjectId(id)) }; 
        }
    
        //Filter by ids of a variants brand attribute
        if ( req.query.brand ) { 
            const brandIDs = req.query.brand.split(',');
            filters['variants.attributes.brand'] = { $in: brandIDs.map(id => Types.ObjectId(id)) }; 
        }

        //Filter by for (male, female, unisex)
        if ( req.query.for ) { 
            const forWho = req.query.for.split(',');
            filters.for = { $in: forWho }; 
        }
    
        //Filter by price
        if ( req.query.minPrice ) { 
            filters['prices.0.amount'] = { $gte: parseInt(req.query.minPrice) }; 
        }
        if ( req.query.maxPrice ) { 
            filters['prices.0.amount'] = { $lte: parseInt(req.query.maxPrice) }; 
        }
        if ( req.query.minPrice  && req.query.maxPrice ) { 
            filters['prices.0.amount'] = { 
                $gte: parseInt(req.query.minPrice),
                $lte: parseInt(req.query.maxPrice)
            }; 
        }
    
        //Filter by minimal stock
        if ( req.query.minStock ) {
            filters['variants'] = {
                $elemMatch: { 
                    stock: { $gte: parseFloat(req.query.minStock) } 
                }
            }
        }
    
        //Looking up attributes
        const colorLookup = {
            from: 'colors',
            localField: 'variants.attributes.color',
            foreignField: '_id',
            as: 'variants.attributes.color'
        }
    
        const brandLookup = {
            from: 'brands',
            localField: 'variants.attributes.brand',
            foreignField: '_id',
            as: 'variants.attributes.brand'
        }

        //Looking up images
        const imageLookup = {
            from: 'images',
            localField: 'images',
            foreignField: '_id',
            as: 'images'
        }

        const variantImageLookup = {
            from: 'images',
            localField: 'variants.images',
            foreignField: '_id',
            as: 'variants.images'
        }

        //Grouping variants
        const variantGoup = {
            _id: '$_id',
            product: { $first: '$$ROOT' },
            variants: {
                $push: '$variants'
            }
        }

        const unsetVariantGroup = ['product.variants', '_id'];

        const replaceVariantGroup = {
            $mergeObjects: [
                '$$ROOT.product',
                { variants: '$variants' }
            ]
        }

        //Sorting documents
        const [field, order] = req.query.sort?.split(',') || [];

        const sort = (field && order) ? {
            [field || '_id']: parseInt(order) || -1
        } : {
            _id: -1
        };

        //Pagination
        const { limit, skip } = req.query;

        const pagination = { 
            limit: limit ? parseInt(limit) : 1000,
            skip: skip ? parseInt(skip) : 0
        };

        //Connecting all stages
        const plainPipeline = [
            { $lookup: catLookup },
            { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true }},
            { $lookup: parentCatLookup },
            { $unwind: { path: '$cat.parent', preserveNullAndEmptyArrays: true } },
            { $match: filters },
            { $unwind: { path: '$variants', preserveNullAndEmptyArrays: true }},
            { $lookup: colorLookup },
            { $lookup: brandLookup },
            { $lookup: imageLookup },
            { $lookup: variantImageLookup },
            { $unwind: { path: '$variants.attributes.color', preserveNullAndEmptyArrays: true }},
            { $unwind: { path: '$variants.attributes.brand', preserveNullAndEmptyArrays: true }},
            { $group: variantGoup },
            { $unset: unsetVariantGroup },
            { $replaceWith: replaceVariantGroup }
        ];

        const paginationPipeline = [
            { $sort: sort },
            { $skip: pagination.skip },
            { $limit: pagination.limit }
        ]

        const countPipeline = [
            { $count: 'total' }
        ]

        const queries = [];

        queries.push(Product.aggregate([...plainPipeline, ...paginationPipeline]));
        queries.push(Product.aggregate([...plainPipeline, ...countPipeline]));

        Promise.all(queries)
            .then(([result, countResult]) => {
                res.header('X-Total-Count', countResult[0]?.total || 0);
                res.json(result);
            })
            .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;
        const {isSlug} = req.query;
    
        Product.findOne({[isSlug ? 'slug' : '_id']: _id})
            .populate({
                path: 'images',
                model: 'Image'
            })
            .populate({
                path: 'variants.images',
                model: 'Image'
            })
            .populate({
                path: 'variants.attributes.color',
                model: 'Color'
            })
            .populate({
                path: 'variants.attributes.brand',
                model: 'Brand'
            })
            .then(result => res.json(result))
            .catch(next);
    },

    create(req, res, next) {
        const {body} = req;
    
        Product.create(body)
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const { body, params: {_id} } = req;
        const amounts = body.prices.map(price => price.amount);

        body.minPrice = Math.min(...amounts);
        body.maxPrice = Math.max(...amounts);

        Product.update({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Product.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Product.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    getFilters(req, res, next) {
        //Initial category lookup
        const catLookup = {
            from: 'cats',
            localField: 'cat',
            foreignField: '_id',
            as: 'cat'
        }
    
        const parentCatLookup = {
            from: 'cats',
            localField: 'cat.parent',
            foreignField: '_id',
            as: 'cat.parent'
        }
    
        //Basic filtering
        const filters = {$and: []}
    
        //Filter by category id
        if ( req.query.catId ) {
            const {catId} = req.query;
    
            filters['$and'].push({
                $or: [
                    {"cat._id": Types.ObjectId(catId)},
                    {"cat.parent._id": Types.ObjectId(catId)}
                ]
            });
        }
    
        //Filter by category slug
        if ( req.query.catSlug ) {
            const {catSlug} = req.query;
    
            filters['$and'].push({
                $or: [
                    {"cat.slug": catSlug},
                    {"cat.parent.slug": catSlug}
                ]
            })
        }

        //Filter by search string
        if ( req.query.search ) {
            const searchStrings = req.query.search.split('%20');

            const searchRegex = new RegExp( 
                '^' +
                searchStrings.reduce(( acc, next ) => {
                    acc += `(?=.*${next}.*)`;
                    return acc;
                }, '') +
                '.*$', 'i'
            );

            filters['$and'].push({
                $or: [
                    { name: { $regex: searchRegex } },
                    { desc: { $regex: searchRegex } },
                    { sku: { $regex: searchRegex } },
                    { 'cat.name': { $regex: searchRegex } }
                ]
            });
        }

        if ( filters['$and'].length === 0 ) delete filters['$and'];
    
        //Filter by price
        if ( req.query.minPrice ) { 
            filters['prices.0.amount'] = { $gte: parseInt(req.query.minPrice) }; 
        }
        if ( req.query.maxPrice ) { 
            filters['prices.0.amount'] = { $lte: parseInt(req.query.maxPrice) }; 
        }
        if ( req.query.minPrice  && req.query.maxPrice ) { 
            filters['prices.0.amount'] = { 
                $gte: parseInt(req.query.minPrice),
                $lte: parseInt(req.query.maxPrice)
            }; 
        }

        //Group filters
        const group = {
            _id: 'filters',
            for: {
                $addToSet: {
                    name: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$for', 'male'] }, then: 'Мужчинам' },
                                { case: { $eq: ['$for', 'female'] }, then: 'Женщинам' },
                                { case: { $eq: ['$for', 'unisex'] }, then: 'Унисекс' }
                            ]
                        }
                    },
                    _id: '$for'
                }
            },
            brands: {
                $addToSet: '$variants.attributes.brand'
            },
            colors: {
                $addToSet: '$variants.attributes.color'
            },
            materials: {
                $addToSet: '$materials'
            }
        }

        //Looking up colors, brands and materials
        const colorLookup = {
            from: 'colors',
            localField: 'colors',
            foreignField: '_id',
            as: 'colors'
        }
    
        const brandLookup = {
            from: 'brands',
            localField: 'brands',
            foreignField: '_id',
            as: 'brands'
        }

        const materialsLookup = {
            from: 'materials',
            localField: 'materials',
            foreignField: '_id',
            as: 'materials'
        }

        //Project result
        const project = {
            '_id': 0,
            'colors.__v': 0,
            'brands.__v': 0,
            'materials.__v': 0
        }

        const pipeline = [
            { $lookup: catLookup },
            { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true }},
            { $lookup: parentCatLookup },
            { $unwind: { path: '$cat.parent', preserveNullAndEmptyArrays: true } },
            { $match: filters },
            { $unwind: { path: '$variants', preserveNullAndEmptyArrays: true }},
            { $group: group },
            { $lookup: colorLookup },
            { $lookup: brandLookup },
            { $lookup: materialsLookup },
            { $project: project }
        ]

        Product.aggregate(pipeline)
            .then(([filters]) => res.send(filters))
            .catch(err => next(err));
    }
}