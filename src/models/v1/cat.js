import { Schema, model, SchemaTypes } from 'mongoose';

const catSchema = new Schema({
    name: String,
    slug: {
        type: String,
        unique: true
    },
    parent: String,
    posts: [{
        title: String,
        content: String,
        thumbnail: String,
        image: String,
        product: String
    }]
},
{
    timestamps: false,
    toJSON: { virtuals: true }
});

catSchema.virtual('ancestors', {
    ref: 'Cat',
    localField: 'ancestors',
    foreignField: 'slug',
    justOne: false
});

const Cat = model('Cat', catSchema, 'categories');

module.exports = Cat;