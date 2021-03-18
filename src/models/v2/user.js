import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';

require('dotenv').config();

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 255
    },
    // email: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    role: {
        type: String,
        required: true,
        enum: ['admin', 'guest', 'customer']
    }
}, {
    timestamps: {
        createdAt: 'meta.createdAt',
        updatedAt: 'meta.updatedAt'
    }
});

userSchema.methods.generateToken = function() {
    const secret = process.env.SECRET;
    const token = jwt.sign({ _id: this._id, role: this.role }, secret);
    return token;
}

module.exports = model('User', userSchema);