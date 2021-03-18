import { Schema, model, SchemaTypes } from 'mongoose';

const materialSchema = new Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = model('Material', materialSchema);