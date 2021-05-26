const Post = require('../models/post');

module.exports = {
    //TODO!!! добавить сортировку по нескольким полям
    getList(req, res, next) {
        let filters = {};

        if ( req.query.page ) filters.page = req.query.page;
        if ( req.query.type ) filters.type = req.query.type;
        if ( req.query.cat ) filters.cats = { $in: [req.query.cat] };

        //Sorting documents
        const [field, order] = req.query.sort?.split(',') || [];

        const sort = (field && parseInt(order)) ? {
            [field]: parseInt(order)
        } : {
            _id: 1
        };

        //Pagination
        const { limit, skip } = req.query;

        const pagination = { 
            limit: limit ? parseInt(limit) : 0,
            skip: skip ? parseInt(skip) : 0
        };

        Promise.all([
            Post.find(filters, null, pagination)
            .sort(sort)
            .populate({
                path: 'image',
                model: 'Image'
            }),
            Post.count(filters)
        ])
            .then(([result, count]) => {
                res.header('X-Total-Count', count);
                res.json(result);
            })
            .catch(next);

        // Post.find(filter, null, pagination).sort(sort)
        //     .populate({
        //         path: 'image',
        //         model: 'Image'
        //     })
        //     .then(result => {
        //         res.header('X-Total-Count', result.length);
        //         res.json(result);
        //     })
        //     .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;
        const {isSlug} = req.query;

        Post.findOne({[isSlug ? 'slug' : '_id']: _id})
            .populate({
                path: 'image',
                model: 'Image'
            })
            .then(result => res.json(result))
            .catch(next);
    },

    create(req, res, next) {
        const {body} = req;

        Post.create(body)
            .then(result => res.json(result))
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Post.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Post.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;

        body.slug = body.name.toLowerCase().replace(/\s/g, '_');
        
        Post.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}