const { Schema, model } = require('mongoose');
const slugify = require('../helpers/slugify');

const postSchema = new Schema({
    name:  {
        type: String,
        unique: true,
        required: true
    },
    image: Schema.Types.ObjectId,
    slug: {
        type: String,
        unique: true,
        required: true,
        default() {
            return slugify(this.name);
        }
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

const Post = model( 'Post', postSchema );

module.exports = Post;