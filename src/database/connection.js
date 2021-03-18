import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const DB_URI = `mongodb://127.0.0.1:27017`;
mongoose.connect(DB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const connection = mongoose.connection;

autoIncrement.initialize(connection);
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => console.log('connection successful'));

module.exports = connection;
