import express from 'express';
import bodyParser from 'body-parser';
import db from './database/connection';

require('dotenv').config();
const app = express();
app.use(bodyParser.json());

app.use('/products', require('./routes/products'));
app.use('/dev', require('./routes/dev'));

const server = app.listen(process.env.port || 3001, () => console.log(`app is running on port ${server.address().port}`));