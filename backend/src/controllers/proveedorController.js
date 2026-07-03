const { proveedor } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(proveedor, 'Proveedor');
