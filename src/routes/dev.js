import Color from '../database/models/color';
import Brand from '../database/models/brand';
import Product from '../database/models/product';

const router = require('express').Router(); 

//Color endpoints
router.get('/colors', (req, res) => {
    Color.find()
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

router.post('/colors/create', (req, res) => {
    Color.create(req.body)
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

//Brand endpoints
router.get('/brands', (req, res) => {
    Brand.find()
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

router.post('/brands/create', (req, res) => {
    Brand.create(req.body)
        .then( data => res.send(data) )
        .catch( err => res.send(err) );
});

//Product endpoints
router.post('/products/create', (req, res) => {
    Product.create( req.body )
        .then( data => res.send(data) )
        .catch( err => res.send(err) );   
});

router.post('/products/update', (req, res) => {
    const ids = req.body.map( ({_id}) => _id );

    for ( const [i,id] of ids.entries() ) {
        Product.findOneAndUpdate({id}, { ...req.body[i] }, {useFindAndModify: false}, (err) => {
            if (err) res.send(err);
        });
    };

    res.send('updated');
});

router.post('/products/remove', (req, res) => {
    const call = req.query.many === "many" ? 
    Product.deleteMany(req.body) :
    Product.deleteOne(req.body);

    call.then( data => res.send(data) )
        .catch( err => res.send(err) );   
});

//Filters endpoints
router.get('/filters', (req, res) => {

    const filterIds = 
    Product.aggregate([
        {
            $unwind: '$variants'
        },
        {
            $unwind: '$variants.attr'
        },
        { 
            $group: {
                _id: 0,
               colors: {$addToSet: '$variants.attr.color'},
               brands: {$addToSet: '$variants.attr.brand'}
            }
        },
        {
            $lookup: {
                from: Color.collection.name,
                localField: 'colors',
                foreignField: '_id',
                as: 'colors'
            }
        },
        {
            $lookup: {
                from: Brand.collection.name,
                localField: 'brands',
                foreignField: '_id',
                as: 'brands'
            }
        },
        {   
            $project: {
                "_id": 0
            }
        }
    ]);

    Color.populate(filterIds, {path: 'colors'})
        .then( data => res.send(data) )
        .catch( err => res.send(err) )
});

module.exports = router;