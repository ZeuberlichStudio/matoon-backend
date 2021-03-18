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
    return this.name.toLowerCase().replaceAll(' ', '_');
}

const Post = model( 'Post', postSchema );

module.exports = Post;