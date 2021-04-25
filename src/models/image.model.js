import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

module.exports = model('Image', imageSchema);