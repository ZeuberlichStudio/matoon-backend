const { Schema, model, SchemaTypes } = require('mongoose');

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
    return this.name.toLowerCase().replace(/\s/g, '_');
}

module.exports = model('Cats', catSchema);