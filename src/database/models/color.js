import {Schema, model} from 'mongoose';

const colorSchema = new Schema({
    name: String,
    value: String
});

const Color = model('Color', colorSchema);

module.exports = Color;