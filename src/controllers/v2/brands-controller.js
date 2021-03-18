import Brand from '~/models/v2/brand';

module.exports = {
    getList(req, res, next) {
        Brand.find()
            .then(result => {
                res.header('X-Total-Count', result.length);
                res.json(result);
            })
            .catch(next);
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