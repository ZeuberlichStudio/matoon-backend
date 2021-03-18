import { Schema, model, SchemaTypes } from 'mongoose';

const catSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    parent: {
        type: SchemaTypes.ObjectId,
        ref: 'Cats'
    },
    slug: {
        type: String,
        unique: true,
        default: generateSlug
    }
},{
    toJSON: {
        virtuals: true
    }
});

function generateSlug() {
    return this.name.toLowerCase().replaceAll(' ', '_');
}

module.exports = model('Cats', catSchema);