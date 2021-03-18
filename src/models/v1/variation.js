import { Schema, model, SchemaTypes } from 'mongoose';

const variationSchema = new Schema({
    parent: {
        type: SchemaTypes.ObjectId,
        ref: 'Product'
    },
    sku: String,
    images: [String],
    color: String,
    brand: String,
    stock: Number
});

const Variation = model('Variation', variationSchema);

module.exports = Variation;