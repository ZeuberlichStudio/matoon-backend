const { Schema, model, SchemaTypes } = require('mongoose');

const materialSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = model('Material', materialSchema);