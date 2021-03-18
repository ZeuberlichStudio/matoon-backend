import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connection from './database/connection';

require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
    exposedHeaders: ['X-Total-Count']
}));
//static
app.use('/static', express.static(__dirname + '/../public'));
//api routes
app.use('/orders', require('~/routes/v2/orders'));
app.use('/users', require('~/routes/v2/users'));
app.use('/images', require('~/routes/v2/images'));
app.use('/posts', require('~/routes/v2/posts'));
app.use('/cats', require('~/routes/v2/cats'));
app.use('/products', require('~/routes/v2/products'));
app.use('/colors', require('~/routes/v2/colors'));
app.use('/brands', require('~/routes/v2/brands'));
app.use('/materials', require('~/routes/v2/materials'));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`app is running on port ${server.address().port}`));