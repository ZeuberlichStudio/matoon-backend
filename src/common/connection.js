const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const mode = process.env.NODE_ENV || 'production';

require('dotenv').config({ 
    path: require('path').resolve(__dirname, '../..', mode == 'production' ? '.env' : '.env.dev')
});

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const connection = mongoose.connection;

autoIncrement.initialize(connection);
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => console.log('connection successful'));

module.exports = connection;
