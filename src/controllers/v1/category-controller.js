import Cat from '../models/cat';
import axios from 'axios';

exports.skladModelCategory = async function(req, res, next) {
    const moyskladEntityUrl = req.body?.events[0]?.meta?.href;

    const token = 'd4901ee73ae855fef09c1e31a491462a02dc9cb9';
    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
    }

    try {
        const { data: moyskladEntity } = await axios.get(moyskladEntityUrl, axiosConfig);
        const ancestors = moyskladEntity.pathName.split('/');
        const cat = {
            name: moyskladEntity.name,
            slug: moyskladEntity.name.replace(/\s+/g, '-').toLowerCase(),
            parent: ancestors[ancestors.length - 1].replace(/\s+/g, '-').toLowerCase(),
            ancestors
        }

        req.body = cat;
        req.omitRes = true;
        next();
    } catch (error) {
        next(error);
    }
}

exports.createCat = async function(req, res, next) {
    try {
        const query = await Cat.create(req.body);
        if ( req.omitRes ) res.end();
        else res.json(query);
    } catch (error) {
        next(error);
    }
}