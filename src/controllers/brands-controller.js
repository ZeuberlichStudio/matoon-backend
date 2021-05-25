const Brand = require('../models/brand');

module.exports = {
    getList(req, res, next) {
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
            Brand.find({}, null, pagination).sort(sort),
            Brand.count()
        ])
            .then(([result, count]) => {
                res.header('X-Total-Count', count);
                res.json(result);
            })
            .catch(next);
        // Brand.find()
        //     .then(result => {
        //         res.header('X-Total-Count', result.length);
        //         res.json(result);
        //     })
        //     .catch(next);
    },
    
    getByID(req, res, next) {
        const {_id} = req.params;
    
        Brand.findOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },
    
    create(req, res, next) {
        const {body} = req;

        Brand.create(body)
            .then(result => res.json(result))
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Brand.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {
        Brand.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;
        
        Brand.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}