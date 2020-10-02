import {Schema, model, SchemaTypes} from 'mongoose';

const productSchema = new Schema({
    name: String,
    sku: String,
    description: String,
    shortDescription: String,
    price: Number,
    variants: [{
        images: [String],
        name: String,
        color: { type: String, ref: 'Color' },
        brand: { type: String, ref: 'Brand' }
    }],
    specs: SchemaTypes.Mixed,
    attributes: {
        colors: [{ type: String, ref: 'Color' }],
        brands: [String],
        sizes: [String]
    },
    meta: {
        stock: Number,
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