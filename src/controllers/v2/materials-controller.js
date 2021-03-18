import Material from '~/models/v2/material';

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


        Material.find({}, null, pagination).sort(sort)
            .then(result => {
                res.header('X-Total-Count', result.length);
                res.json(result);
            })
            .catch(next);
    },
    
    getByID(req, res, next) {
        const {_id} = req.params;
    
        Material.findOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },
    
    create(req, res, next) {
        const {body} = req;
    
        Material.create(body)
            .then(result => res.json(result))
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Material.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Material.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;
        
        Material.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}