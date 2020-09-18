import {Schema, model, SchemaTypes} from 'mongoose';

const productSchema = new Schema({
    name: String,
    sku: String,
    desc: String,
    price: Number,
    variants: [{
        name: String,
        attr: {
            color: { type: SchemaTypes.ObjectId, ref: 'Color' },
            brand: { type: SchemaTypes.ObjectId, ref: 'Brand' }
        }
    }],
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