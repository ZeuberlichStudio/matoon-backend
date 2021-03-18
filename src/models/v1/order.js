import { Schema, model, SchemaType } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const customerSchema = new Schema({
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
    }
});

const itemSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    qty: {
        type: Number,
        required: true
    }
}, { _id : false });

itemSchema.virtual('subtotal').get(() => this.price * qty);

const contactMethodSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true
    }
}, { _id : false });

const shippingMethodSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true
    }
}, { _id : false });

const paymentMethodSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: function () { return !(this.name.localeCompare('выставлени счета', undefined, { sensitivity: 'base' }) > 0) }
    }
}, { _id : false });

const orderSchema = new Schema({
    customer: {
        type: customerSchema,
        required: true
    },
    contactMethod: {
        type: contactMethodSchema,
        required: true
    },
    shippingMethod: {
        type: shippingMethodSchema,
        required: true
    },
    paymentMethod: {
        type: paymentMethodSchema,
        required: true
    },
    items: [itemSchema],
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

orderSchema.virtual('total').get(function() {
    let total = 0;

    for ( item of this.items ) {
        total = total + item.subtotal;
    }

    return total;
})

orderSchema.plugin(autoIncrement.plugin, { model: 'Order', field: 'publicId', startAt: 1000, incrementBy: 1 });

const Order = model('Order', orderSchema);

module.exports = Order;