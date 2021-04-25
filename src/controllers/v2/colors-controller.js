import Color from '~/models/v2/color';

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
            Color.find({}, null, pagination).sort(sort),
            Color.count({})
        ])
            .then(([result, count]) => {
                res.header('X-Total-Count', count);
                res.json(result);
            })
            .catch(next);

        // Color.find({}, null, pagination).sort(sort)
        //     .then(result => {
        //         res.header('X-Total-Count', result.length);
        //         res.json(result);
        //     })
        //     .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;

        Color.findOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    create(req, res, next) {
        const {body} = req;

        Color.create(body)
            .then(result => res.json(result))
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Color.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Color.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;
        
        Color.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}