import mongoose, { Schema, model } from 'mongoose';
const AutoIncrement = require('mongoose-sequence')(mongoose);

const orderItemShcema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Products'
    },
    variant: Schema.Types.ObjectId,
    sku: {
        type: String,
        required: true
    },
    attributes: {
        brand: String,
        color: String
    },
    price: {
        type: Number,
        required: true
    },
    qty: {
        type: Number,
        required: true
    }
});

const orderSchema = new Schema({
    items: {
        type: [orderItemShcema],
        required: true
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        mail: {
            type: String,
            required: true
        },
        contactBy: {
            type: String,
            enum: ['phone', 'mail', 'wapp', 'tg', 'viber'],
            required: true
        }
    },
    shipping: {
        method: {
            type: String,
            enum: ['pickup', 'carrier', 'sdek', 'pek', 'dellin', 'baikalserv', 'custom'],
            required: true
        },
        address: {
            type: String,
            required() { return (
                this.shipping.method === 'carrier' || this.shipping.method === 'sdek' ||
                this.shipping.method === 'pek' || this.shipping.method === 'dellin' ||
                this.shipping.method === 'baikalserv'
            ); }
        },
        pickupPoint: {
            type: String,
            required() { return this.shipping.method === 'pickup'; }
        },
        comment: {
            type: String,
            required() { return this.shipping.method === 'custom'; }
        }
    },
    payment: {
        method: {
            type: String,
            enum: ['cash', 'transfer', 'bill'],
            required: true
        },
        inn:  {
            type: Number,
            required() { return this.payment.method === 'bill'; }
        },
        companyName:  {
            type: String,
            required() { return this.payment.method === 'bill'; }
        },
        companyAddress:  {
            type: String,
            required() { return this.payment.method === 'bill'; }
        }
    },
    meta: {
        number: Number
    }
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    },
    toJSON: { virtuals: true }
});

orderSchema.plugin(AutoIncrement, {
    id: 'orderNumberSeq', 
    inc_field: 'meta.number',
    referenceFields: ['meta.createdAt']
});

orderSchema.virtual('publicId').get(function() {
    const { createdAt, number } = this.meta;
    const date = createdAt.getDate().toString().padStart(2, 0);
    const month = (createdAt.getMonth() + 1).toString().padStart(2, 0);
    const year = createdAt.getFullYear().toString().slice(2);

    return `${date}${month}${year}${number}`;
});

module.exports = model('Order', orderSchema);