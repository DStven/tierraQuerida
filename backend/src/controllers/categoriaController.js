const { categoria } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(categoria, 'Categoria');
