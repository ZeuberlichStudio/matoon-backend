import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './database/connection';

require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/static', express.static(__dirname + '/../public'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));
app.use('/feed', require('./routes/feed'));
app.use('/search', require('./routes/search'));

app.use('/dev', require('./routes/dev'));

const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`app is running on port ${server.address().port}`));