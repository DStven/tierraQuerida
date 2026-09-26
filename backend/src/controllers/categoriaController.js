const { categoria } = require('../models/resourceModels');
const createCrudController = require('./crudControllerFactory');
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const auditLogger = require('../utils/auditLogger');

const categoriaController = createCrudController(categoria, 'Categoria');

// Una categoría no puede eliminarse mientras esté asociada a productos o inventario.
// Se valida antes del DELETE para devolver un error útil en vez de una excepción de MySQL.
categoriaController.remove = asyncHandler(async (req, res) => {
  const existing = await categoria.findById(req.params.id);

  if (!existing) {
    return error(res, 404, 'Categoria no encontrado');
  }

  const [[usage]] = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM producto WHERE id_categoria = ?) AS productos,
      (SELECT COUNT(*) FROM inventario WHERE id_categoria = ?) AS inventarios`,
    [req.params.id, req.params.id],
  );

  if (usage.productos > 0 || usage.inventarios > 0) {
    const references = [];
    if (usage.productos > 0) references.push(`${usage.productos} producto(s)`);
    if (usage.inventarios > 0) references.push(`${usage.inventarios} registro(s) de inventario`);

    return error(
      res,
      409,
      `No se puede eliminar la categoria porque está asociada a ${references.join(' y ')}.`,
    );
  }

  await categoria.delete(req.params.id);

  if (req.user && req.user.id_usuario) {
    auditLogger.log(req.user.id_usuario, 'Eliminar Categoria', `Eliminó Categoria id ${req.params.id}`);
  }

  success(res, 200, 'Categoria eliminado correctamente');
});

module.exports = categoriaController;
