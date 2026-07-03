const inventarioModel = require('../models/inventarioModel');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const requiredFields = [
  'producto',
  'cantidad',
  'stock_minimo',
  'precio_unitario',
  'id_categoria',
];

// Revisa campos obligatorios al crear producto.
const missingRequiredFields = (body) => requiredFields.filter((field) => (
  body[field] === undefined || body[field] === null || body[field] === ''
));

// Fecha por defecto para nuevos registros.
const getCurrentDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// Une datos nuevos con datos existentes para actualizar.
const buildInventarioData = (body, existing = {}) => ({
  producto: body.producto ?? existing.producto,
  cantidad: body.cantidad ?? existing.cantidad,
  stock_minimo: body.stock_minimo ?? existing.stock_minimo,
  unidad_medida: body.unidad_medida ?? existing.unidad_medida,
  precio_unitario: body.precio_unitario ?? existing.precio_unitario,
  estado: body.estado ?? existing.estado ?? 1,
  fecha_registro: body.fecha_registro ?? existing.fecha_registro ?? getCurrentDateTime(),
  id_categoria: body.id_categoria ?? existing.id_categoria,
});

// Lista inventario.
const getAll = asyncHandler(async (_req, res) => {
  const inventario = await inventarioModel.findAll();
  success(res, 200, 'Inventario listado correctamente', inventario);
});

// Obtiene un producto del inventario.
const getById = asyncHandler(async (req, res) => {
  const inventario = await inventarioModel.findById(req.params.id);

  if (!inventario) {
    return error(res, 404, 'Producto de inventario no encontrado');
  }

  return success(res, 200, 'Producto de inventario encontrado', inventario);
});

// Crea un producto nuevo.
const create = asyncHandler(async (req, res) => {
  const missingFields = missingRequiredFields(req.body);

  if (missingFields.length > 0) {
    return error(res, 400, 'Faltan campos obligatorios', missingFields);
  }

  const existingInventario = await inventarioModel.findByProducto(req.body.producto, req.body.id_categoria);
  if (existingInventario) {
    return error(res, 409, 'Este producto ya se encuentra registrado en el inventario.');
  }

  const inventario = await inventarioModel.create(buildInventarioData(req.body));
  return success(res, 201, 'Producto agregado al inventario correctamente', inventario);
});

// Actualiza un producto existente.
const update = asyncHandler(async (req, res) => {
  const existingInventario = await inventarioModel.findById(req.params.id);

  if (!existingInventario) {
    return error(res, 404, 'Producto de inventario no encontrado');
  }

  const requestedProducto = req.body.producto ?? existingInventario.producto;
  const requestedCategoria = req.body.id_categoria ?? existingInventario.id_categoria;
  const duplicateInventario = await inventarioModel.findByProducto(requestedProducto, requestedCategoria);

  if (duplicateInventario && duplicateInventario.id_inventario !== Number(req.params.id)) {
    return error(res, 409, 'Este producto ya se encuentra registrado en el inventario.');
  }

  const inventario = await inventarioModel.update(
    req.params.id,
    buildInventarioData(req.body, existingInventario),
  );

  return success(res, 200, 'Producto de inventario actualizado correctamente', inventario);
});

// Elimina un producto.
const remove = asyncHandler(async (req, res) => {
  const deleted = await inventarioModel.delete(req.params.id);

  if (!deleted) {
    return error(res, 404, 'Producto de inventario no encontrado');
  }

  return success(res, 200, 'Producto de inventario eliminado correctamente');
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
