const {Schema, model} = require('mongoose');

const brandSchema = new Schema({
    name: String
});

module.exports = model('Brand', brandSchema);