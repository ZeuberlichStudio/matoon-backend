const { Schema, model, SchemaTypes } = require('mongoose');

const priceSchema = new Schema({
    minQty: Number,
    amount: Number
});

const variantSchema = new Schema({
    images: {
        type: [SchemaTypes.ObjectId],
        ref: 'Image'
    },
    attributes: {
        color: {
            type: SchemaTypes.ObjectId,
            ref: 'Color',
            required: true
        },
        brand: {
            type: SchemaTypes.ObjectId,
            ref: 'Brand',
            required: true
        }
    },
    stock: {
        type: Number,
        default: 0,
        required: true
    }
});

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    sku:  {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        default: function() { 
            return this.sku; 
        }
    },
    desc: String,
    shortDesc: String,
    images: {
        type: [SchemaTypes.ObjectId],
        ref: 'Image'
    },
    cat: {
        type: SchemaTypes.ObjectId,
        ref: 'Cats'
    },
    variants: [variantSchema],
    materials: {
        type: [SchemaTypes.ObjectId],
        ref: 'Material'
    },
    specs: {
        type: [[String]],
        validate: [validateSpecs, 'Only arrays of two strings are allowed.']
    },
    for: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        default: 'unisex'
    },
    prices: {
        type: [priceSchema],
        required: true,
        validate: [validatePrices, 'First price minQty must be 1']
    },
    minPrice: {
        type: String,
        required: true,
        default: function() {
            const amounts = this.prices.map(price => price.amount);
            return Math.min(...amounts);
        }
    },
    maxPrice: {
        type: String,
        required: true,
        default: function() {
            const amounts = this.prices.map(price => price.amount);
            return Math.max(...amounts);
        }
    },
    shippingDetails: {
        dimensions: {
            w: {
                type: Number,
                // required: true
            },
            l: {
                type: Number,
                // required: true
            },
            h: {
                type: Number,
                // required: true
            }
        },
        weight: {
            type: Number,
            // required: true
        }
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    meta: {
        createdAt: Date,
        updatedAt: Date
    }
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    },
    toJSON: { virtuals: true }
});

productSchema.virtual('computedPrices').get(function() {
    const computedPrices = [];

    this.prices.forEach((price, index) => {
        computedPrices[index] = {
            minQty: price.minQty,
            maxQty: this.prices[index + 1]?.minQty - 1 ?? null,
            amount: price.amount
        }
    });

    return computedPrices;
});

function validateSpecs(v) {
    for ( const spec of v ) {
        if ( spec.length !== 2 ) return false;
    }
}

function validatePrices(v) {
    if ( v[0].minQty !== 1 ) return false;
}

module.exports = model('Product', productSchema);