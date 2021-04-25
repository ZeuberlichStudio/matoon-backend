import Image from '~/models/v2/image';

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
            Image.find({}, null, pagination).sort(sort),
            Image.count({})
        ])
            .then(([result, count]) => {
                res.header('X-Total-Count', count);
                res.json(result);
            })
            .catch(next);

        // Image.find({}, null, pagination).sort(sort)
        //     .then(result => {
        //         res.header('X-Total-Count', result.length);
        //         res.json(result);
        //     })
        //     .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;

        Image.findOne({_id})
            .populate('parent')
            .then(result => res.json(result))
            .catch(next);
    },

    async create(req, res, next) {
        const {body} = req;

        if ( Array.isArray(body) ) {
            try {
                const existingImages = await Image.find({ src: { $in: body.map(image => image.src) } });
                const filteredBody = body.filter((image, i) => !existingImages[i]);

                Image.create(filteredBody)
                    .then(result => res.json(result))
                    .catch(next);
            } catch (err) {
                next(err);
            }
        }
        else {
            Image.create(body)
                .then(result => res.json(result))
                .catch(next);
        }
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Image.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Image.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;
        
        Image.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    }
}