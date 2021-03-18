import {Schema, model, SchemaTypes} from 'mongoose';

const productSchema = new Schema({
    name: String,
    sku: String,
    desc: String,
    shortDesc: String,
    images: [String],
    categories: [String],
    for: String,
    variations: [{
        type: Schema.Types.ObjectId,
        ref: 'Variations'
    }],
    attributes: {
        colors: [{ type: String, ref: 'Color' }],
        brands: [{ type: String, ref: 'Brand' }]
    },
    specs: SchemaTypes.Mixed,
    materials: [String],
    measurments: {
        width: '',
        length: '',
        height: '',
        weight: '' 
    },
    prices: [{
        minQty: Number,
        maxQty: Number,
        amount: Number,
    }],
    suggested: [String],
    meta: {
        orders: Number,
        createdAt: Date,
        updatedAt: Date
    }
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

const Product = model('Product', productSchema);

module.exports = Product;