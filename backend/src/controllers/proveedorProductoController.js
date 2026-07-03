const { proveedor_producto } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');

module.exports = createCrudController(proveedor_producto, 'ProveedorProducto');
