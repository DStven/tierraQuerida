const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

const auditLogger = require('../utils/auditLogger');

const createCrudController = (model, resourceName) => ({
  getAll: asyncHandler(async (_req, res) => {
    const rows = await model.findAll();
    success(res, 200, `${resourceName} listados correctamente`, rows);
  }),

  getById: asyncHandler(async (req, res) => {
    const row = await model.findById(req.params.id);

    if (!row) {
      return error(res, 404, `${resourceName} no encontrado`);
    }

    success(res, 200, `${resourceName} encontrado`, row);
  }),

  create: asyncHandler(async (req, res) => {
    const row = await model.create(req.body);
    // Log auditoria si hay usuario autenticado
    if (req.user && req.user.id_usuario) {
      auditLogger.log(req.user.id_usuario, `Crear ${resourceName}`, `Creó ${resourceName} con id ${row[model.primaryKey] || row.id || ''}`);
    }
    success(res, 201, `${resourceName} creado correctamente`, row);
  }),

  update: asyncHandler(async (req, res) => {
    const existing = await model.findById(req.params.id);

    if (!existing) {
      return error(res, 404, `${resourceName} no encontrado`);
    }

    const row = await model.update(req.params.id, req.body);
    if (req.user && req.user.id_usuario) {
      auditLogger.log(req.user.id_usuario, `Actualizar ${resourceName}`, `Actualizó ${resourceName} id ${req.params.id}`);
    }
    success(res, 200, `${resourceName} actualizado correctamente`, row);
  }),

  remove: asyncHandler(async (req, res) => {
    const deleted = await model.delete(req.params.id);

    if (!deleted) {
      return error(res, 404, `${resourceName} no encontrado`);
    }

    if (req.user && req.user.id_usuario) {
      auditLogger.log(req.user.id_usuario, `Eliminar ${resourceName}`, `Eliminó ${resourceName} id ${req.params.id}`);
    }

    success(res, 200, `${resourceName} eliminado correctamente`);
  }),
});

module.exports = createCrudController;
