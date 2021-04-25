import Cat from '~/models/v2/cat';

module.exports = {
    //TODO!!! добавить сортировку по нескольким полям
    getList(req, res, next) {
        const filters = {};

        if ( req.query.parent ) {
            const {parent} = req.query;
            filters.parent = parent !== 'null' ? parent : null;
        }

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
            Cat.find(filters, null, pagination).sort(sort),
            Cat.count(filters)
        ])
            .then(([result, count]) => {
                res.header('X-Total-Count', count);
                res.json(result);
            })
            .catch(next);

        // Cat.find(filters, null, pagination).sort(sort)
        //     .then(result => {
        //         res.header('X-Total-Count', result.length);
        //         res.json(result);
        //     })
        //     .catch(next);
    },

    getByID(req, res, next) {
        const {_id} = req.params;
        const {isSlug} = req.query;

        Cat.findOne({[isSlug ? 'slug' : '_id']: _id})
            .populate('parent')
            .then(result => res.json(result))
            .catch(next);
    },

    create(req, res, next) {
        const {body} = req;

        Cat.create(body)
            .then(result => res.json(result))
            .catch(next);
    },

    remove(req, res, next) {
        const {_id} = req.params;
        
        Cat.deleteOne({_id})
            .then(result => res.json(result))
            .catch(next);
    },

    removeMany(req, res, next) {        
        Cat.deleteMany({_id: req.body})
            .then(result => res.json(result))
            .catch(next);
    },

    update(req, res, next) {
        const {body, params: {_id}} = req;
        
        Cat.updateOne({_id}, body)
            .then(result => res.json(result))
            .catch(next);
    },

    async getCatsTree(req, res, next) {
        try {
            const topLevel = await Cat.find({parent: null}).sort({name: 1}).lean();
            const subCatsQueries = topLevel.map(cat => Cat.find({parent: cat._id}).sort({name: 1}));

            Promise.all(subCatsQueries)
                .then(data => { 
                    const [...tree] = topLevel;
                    data.forEach((subcats, i) => tree[i].subcats = subcats);
                    return tree;
                })
                .then(tree => res.send(tree))
                .catch(err => next(err))
        } catch (error) {
            next(error);
        }
    }
}