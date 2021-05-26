require('regenerator-runtime');
const mongoose = require('mongoose');
const ExpressLoader = require('./loaders/ExpressLoader');

const mongooseOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect(process.env.DB_URI, mongooseOptions)
    .then(() => {
        console.log('Database connection established.');
        new ExpressLoader();
    })
    .catch(error => console.error(error));