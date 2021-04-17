import { Schema, model } from 'mongoose';

const postSchema = new Schema({
    title: String,
    image: String,
    slug: {
        type: String,
        unique: true,
        default: generateSlug()
    },
    content: String,
    size: {
        type: String,
        default: 'medium'
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