import mongoose from 'mongoose';

require('dotenv').config();
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => console.log('connection successful'));

module.exports = connection;
