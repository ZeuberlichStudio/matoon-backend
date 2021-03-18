import Post from '~/models/v2/post';

module.exports = {
    getList(req, res, next) {
        let filter = {};

        if ( req.query.page ) filter.page = req.query.page;
        if ( req.query.type ) filter.type = req.query.type;
        if ( req.query.cat ) filter.cats = { $in: [req.query.cat] };

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

        Post.find(filter, null, pagination).sort(sort)
            .populate({
                path: 'image',
                model: 'Image'
            })
            .sort(sort)
            .then(result => {
                res.header('X-Total-Count', result.length);
                res.json(result);
            })
            .catch(next);
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
        
        Post.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}