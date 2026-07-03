const { producto } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');

const productoController = createCrudController(producto, 'Producto');

productoController.getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.id_categoria) {
    filters.id_categoria = req.query.id_categoria;
  }

  const productos = await producto.findAll(filters);
  success(res, 200, 'Productos listados correctamente', productos);
});

module.exports = productoController;
