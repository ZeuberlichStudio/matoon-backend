import regeneratorRuntime from "regenerator-runtime";
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import './database/connection';

require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: ['https://matoon.store', 'https://admin.matoon.store'],
    exposedHeaders: ['X-Total-Count']
}));
//static
app.use('/public', express.static('public'));
//api routes
app.use('/orders', require('~/routes/v2/orders'));
app.use('/users', require('~/routes/v2/users'));
app.use('/images', require('~/routes/image.route'));
app.use('/posts', require('~/routes/v2/posts'));
app.use('/cats', require('~/routes/v2/cats'));
app.use('/products', require('~/routes/v2/products'));
app.use('/colors', require('~/routes/v2/colors'));
app.use('/brands', require('~/routes/v2/brands'));
app.use('/materials', require('~/routes/v2/materials'));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`app is running on port ${server.address().port}`));