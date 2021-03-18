import { Schema, model } from 'mongoose';

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
    return this.name.toLowerCase().replaceAll(' ', '_');
}

const Post = model( 'Post', postSchema );

module.exports = Post;