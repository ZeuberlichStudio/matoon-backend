const express = require('express');

module.exports = app => {
    app.use('/public', express.static('public'));

    app.use('/orders', require('../routes/orders'));
    app.use('/users', require('../routes/users'));
    app.use('/images', require('../routes/ImageRouter'));
    app.use('/posts', require('../routes/posts'));
    app.use('/cats', require('../routes/cats'));
    app.use('/products', require('../routes/products'));
    app.use('/colors', require('../routes/colors'));
    app.use('/brands', require('../routes/brands'));
    app.use('/materials', require('../routes/materials'));
}