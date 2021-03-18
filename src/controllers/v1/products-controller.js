import mongoose from 'mongoose';
import Product from 'models/product';
import Variation from 'models/variation';

exports.getProductById = async (req, res, next) => {
    const { _id } = req.params;
    const query = Product.findOne({_id}).populate('variations').exec();

    try {
       const result = await query; 
       res.json(result);
    } catch (err) {
        next(err);
    }
}

exports.getVariations = async (req, res, next) => {
    const { ids } = req.query;
    const pipeline = [];

    if ( ids ) {
        const objectIds = ids && ids.split(',').map(id => mongoose.Types.ObjectId(id));
        
        pipeline.push({
            $match: {
                _id: {$in: objectIds}
            }
        });
    } 

    pipeline.push(
        {
            $lookup: {
                from: 'products',
                localField: 'parent',
                foreignField: '_id',
                as: 'parent'
            }
        },
        {
            $lookup: {
                from: 'colors',
                localField: 'color',
                foreignField: 'slug',
                as: 'color'
            }
        },
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: 'slug',
                as: 'brand'
            }
        },
        { $unwind: "$parent" },
        { $unwind: "$color" },
        { $unwind: "$brand" },
        { 
            $replaceRoot: {
                "newRoot": {
                    "$mergeObjects": [
                        { 
                            "$arrayToObject": {
                                "$filter": {
                                "input": { "$objectToArray": "$$ROOT" },
                                "cond": { "$not": { "$in":  ["$$this.k", ["parent"]] } },
                                }
                            },
                        },
                        { 
                            "$arrayToObject": {
                                "$filter": {
                                "input": { "$objectToArray": "$$ROOT.parent" },
                                "cond": { "$not": { "$in":  ["$$this.k", ["_id", "sku", "attributes"]] } },
                                }
                            },
                        },
                        {
                            images: { $concatArrays: ['$$ROOT.images', '$$ROOT.parent.images'] }
                        }
                    ]
                }
            }
        }
    );

    const query = Variation.aggregate(pipeline).exec();

    try {
        const result = await query; 

        if ( ids ) {
            const sortedData = [];
            const idsArray = ids.split(',');
            
            for( const doc of result ) {
                const index = idsArray.indexOf(doc._id.toString());
                sortedData[index] = doc;
            }

            sortedData.reverse();
            res.send(sortedData);
        } else {
            res.send(result);
        }
    } catch (err) {
        next(err);
    }
}

exports.getVariationById = async (req, res, next) => {
    const { _id } = req.params;
    const query = Variation.findOne({_id}).populate('parent').exec();

    try {
       const result = await query; 
       res.json(result);
    } catch (err) {
        next(err);
    }
}