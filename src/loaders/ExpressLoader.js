const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('../routes');

class ExpressLoader {
    constructor() {
        const mode = process.env.NODE_ENV || 'production';
        const app = express();
        const corsOptions = {
            origin: mode == 'production' ? '*' : ['https://matoon.store', 'https://admin.matoon.store'],
            exposedHeaders: ['X-Total-Count']
        };

        app.use(cors(corsOptions));        
        app.use(bodyParser.json());

        routes(app);

        this.server = app.listen(process.env.PORT || 3001, () => {
            console.log(`Server runs on port ${this.server.address().port} in ${mode} mode`)
        });
    }

    get Server() {
        return this.server;
    }
}

module.exports = ExpressLoader;