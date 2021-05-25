const { Schema, model } = require('mongoose');

const ImageSizeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    // width: Number,
    // height: Number
}, {
    _id: false
});

const ImageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true,
        unique: true
    },
    // width: Number,
    // height: Number,
    // album: String,
    sizes: {
        tiny: ImageSizeSchema,
        small: ImageSizeSchema,
        medium: ImageSizeSchema,
        large: ImageSizeSchema
    }
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

module.exports = model('Image', ImageSchema);
