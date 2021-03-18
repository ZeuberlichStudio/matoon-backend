import {Schema, model} from 'mongoose';

const brandSchema = new Schema({
    name: String
});

module.exports = model('Brand', brandSchema);