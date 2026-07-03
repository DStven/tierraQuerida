const { rol } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(rol, 'Rol');
