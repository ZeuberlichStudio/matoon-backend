import {Schema, model} from 'mongoose';

const brandSchema = new Schema({
    name: String,
    value: String
});

const Brand = model('Brand', brandSchema);

module.exports = Brand;