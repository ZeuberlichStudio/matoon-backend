import { Schema, model, SchemaTypes } from 'mongoose';

const catSchema = new Schema({
    name: String,
    slug: {
        type: String,
        unique: true
    },
    parent: String,
    ancestors: [String],
    posts: [{
        title: String,
        content: String,
        thumbnail: String,
        image: String,
        product: String
    }]
},
{
    timestamps: false
});

const Cat = model('Cat', catSchema, 'categories');

module.exports = Cat;