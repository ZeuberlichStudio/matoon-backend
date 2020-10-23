import { Schema, model } from 'mongoose';

const postSchema = new Schema({
    title: String,
    image: String,
    slug: {
        type: String,
        unique: true
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

const Post = model( 'Post', postSchema );

module.exports = Post;