import {Schema, model, SchemaTypes} from 'mongoose';

const productSchema = new Schema({
    name: String,
    sku: String,
    desc: String,
    shortDesc: String,
    images: [String],
    categories: [String],
    for: String,
    variants: [{
        images: [String],
        name: String,
        color: { type: String, ref: 'Color' },
        brand: { type: String, ref: 'Brand' },
        stock: Number
    }],
    attributes: {
        colors: [{ type: String, ref: 'Color' }],
        brands: [{ type: String, ref: 'Color' }]
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