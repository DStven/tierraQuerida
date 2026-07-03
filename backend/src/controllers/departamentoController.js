const { departamento } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(departamento, 'Departamento');
