import {Schema, model} from 'mongoose';

const colorSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        required: true
    },
    value: {
        type: String,
        required: true
    }
});

const Color = model('Color', colorSchema);

module.exports = Color;