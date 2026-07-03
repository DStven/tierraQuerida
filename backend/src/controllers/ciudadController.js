const { ciudad } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(ciudad, 'Ciudad');
