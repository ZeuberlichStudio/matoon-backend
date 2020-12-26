import {Schema, model} from 'mongoose';

const colorSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    slug: {
        type: String,
        unique: true
    },
    value: String
});

const Color = model('Color', colorSchema);

module.exports = Color;