const { Schema, model } = require('mongoose');

const postSchema = new Schema({
    name: String,
    image: Schema.Types.ObjectId,
    slug: {
        type: String,
        unique: true,
        required: true,
        default: generateSlug
    },
    content: String,
    shortDesc: String,
    page: Schema.Types.Mixed,
    type: {
        type: String,
        required: true,
        default: 'banner',
        enum: ['feed', 'banner']
    },
    size: {
        type: String,
        required: function() { return this.type === 'feed'; },
        enum: ['small', 'medium', 'big']
    },
    link: String
},{
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

function generateSlug() {
    const re = /\s/g;
    return this.name.toLowerCase().replace(re, '_');
}

const Post = model( 'Post', postSchema );

module.exports = Post;