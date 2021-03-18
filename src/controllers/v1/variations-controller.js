import Variation from 'models/variation';

exports.getVariations = async (req, res, next) => {
    const query = Variation.find().exec();

    try {
       const result = await query; 
       res.json(result);
    } catch (err) {
        next(err);
    }
}

exports.getVariationById = async (req, res, next) => {
    const { _id } = req.params;
    const query = Variation.findOne({_id}).exec();

    try {
       const result = await query; 
       res.json(result);
    } catch (err) {
        next(err);
    }
}