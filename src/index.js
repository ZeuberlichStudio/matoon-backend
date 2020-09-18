import express from 'express';
//import cors from 'cors';
import bodyParser from 'body-parser';
import db from './database/connection';

require('dotenv').config();
const app = express();
//app.use(cors());
app.use(bodyParser.json());

app.use('/products', require('./routes/products'));
app.use('/dev', require('./routes/dev'));

app.listen(8080, () => console.log(`app is running on port ${8080}`));