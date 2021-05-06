import { Schema, model, SchemaType } from 'mongoose';

const BannerSchema = new Schema({
    title: String,
    content: String,
    image: {
        ref: 'Image',
        type: SchemaType.ObjectId
    },
    page: {
        ref: 'Page',
        type: SchemaType.ObjectId
    },
    link: String
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

module.exports = model('Banner', BannerSchema);