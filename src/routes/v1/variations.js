const variationsRouter = require('express').Router();
import { getVariations, getVariationById } from 'controllers/variations-controller';

variationsRouter.get('/', getVariations);
variationsRouter.get('/:_id', getVariationById);

module.exports = variationsRouter;