const { Schema, model } = require('mongoose');

const PageSchema = new Schema({
    name: String,
    path: String
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

module.exports = model('Banner', PageSchema);