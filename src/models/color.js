const {Schema, model} = require('mongoose');

const colorSchema = new Schema({
    name: String,
    code: {
        type: String,
        validate: [validateCode, 'Code must be a HEX value']
    }
});

function validateCode(v) {
    return /^#[0-9A-F]{6}$/i.test(v);
}

module.exports = model('Color', colorSchema);