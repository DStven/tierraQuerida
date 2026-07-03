const { auditoria } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(auditoria, 'Auditoria');
