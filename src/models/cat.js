const { Schema, model, SchemaTypes } = require('mongoose');
const slugify = require('../helpers/slugify');

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
        default() {
            return slugify(this.name);
        }
    }
},{
    toJSON: {
        virtuals: true
    }
});

module.exports = model('Cats', catSchema);