const { pool } = require('../config/db');
const movimientoStockModel = require('../models/movimientoStockModel');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const auditLogger = require('../utils/auditLogger');

// Acepta Entrada o Salida sin depender de mayusculas.
const normalizeMovementType = (tipoMovimiento) => {
  if (!tipoMovimiento) {
    return null;
  }

  const normalized = String(tipoMovimiento).trim().toLowerCase();

  if (normalized === 'entrada') {
    return 'Entrada';
  }

  if (normalized === 'salida') {
    return 'Salida';
  }

  return null;
};

// Fecha por defecto para el movimiento.
const getCurrentDateTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// Lista movimientos de stock.
const getAll = asyncHandler(async (_req, res) => {
  const movimientos = await movimientoStockModel.findAll();
  success(res, 200, 'Movimientos de stock listados correctamente', movimientos);
});

// Obtiene un movimiento especifico.
const getById = asyncHandler(async (req, res) => {
  const movimiento = await movimientoStockModel.findById(req.params.id);

  if (!movimiento) {
    return error(res, 404, 'Movimiento de stock no encontrado');
  }

  return success(res, 200, 'Movimiento de stock encontrado', movimiento);
});

// Registra entrada o salida y actualiza el stock.
const create = asyncHandler(async (req, res) => {
  const tipoMovimiento = normalizeMovementType(req.body.tipo_movimiento);
  const cantidadMovimiento = Number(req.body.cantidad);
  const idInventario = Number(req.body.id_inventario);
  const idUsuario = req.body.id_usuario || req.user.id_usuario;
  const fechaMovimiento = req.body.fecha_movimiento || getCurrentDateTime();
  const observacion = req.body.observacion ? String(req.body.observacion).trim() : null;
  const idProveedor = req.body.id_proveedor || null;

  if (!tipoMovimiento) {
    return error(res, 400, 'tipo_movimiento debe ser Entrada o Salida');
  }

  if (!Number.isFinite(cantidadMovimiento) || cantidadMovimiento <= 0) {
    return error(res, 400, 'cantidad debe ser un numero mayor a cero');
  }

  if (!Number.isFinite(idInventario) || idInventario <= 0) {
    return error(res, 400, 'id_inventario es obligatorio');
  }

  if (!idUsuario) {
    return error(res, 400, 'id_usuario es obligatorio');
  }

  const connection = await pool.getConnection();

  try {
    // Desde aqui todo debe completarse junto o cancelarse junto.
    await connection.beginTransaction();

    // Bloquea el producto mientras se calcula el nuevo stock.
    const [inventarioRows] = await connection.query(
      `SELECT
        id_inventario,
        cantidad
      FROM inventario
      WHERE id_inventario = ?
      LIMIT 1
      FOR UPDATE`,
      [idInventario],
    );

    const inventario = inventarioRows[0];

    if (!inventario) {
      await connection.rollback();
      return error(res, 404, 'Producto de inventario no encontrado');
    }

    // Evita insertar dos movimientos identicos en el mismo segundo por doble envio.
    const [duplicados] = await connection.query(
      `SELECT id_movimiento
      FROM movimiento_stock
      WHERE tipo_movimiento = ?
        AND cantidad = ?
        AND id_usuario = ?
        AND id_inventario = ?
        AND id_proveedor <=> ?
        AND observacion <=> ?
        AND ABS(TIMESTAMPDIFF(SECOND, fecha_movimiento, ?)) <= 1
      ORDER BY id_movimiento DESC
      LIMIT 1`,
      [tipoMovimiento, cantidadMovimiento, idUsuario, idInventario, idProveedor, observacion, fechaMovimiento],
    );

    if (duplicados.length > 0) {
      await connection.rollback();
      return error(res, 409, 'Movimiento duplicado detectado. Verifique el historial antes de registrar de nuevo.');
    }

    const stockActual = Number(inventario.cantidad);
    const nuevoStock = tipoMovimiento === 'Entrada'
      ? stockActual + cantidadMovimiento
      : stockActual - cantidadMovimiento;

    // No permite salidas que dejen inventario negativo.
    if (nuevoStock < 0) {
      await connection.rollback();
      return error(res, 400, 'No se puede registrar la salida porque genera stock negativo', {
        stock_actual: stockActual,
        cantidad_salida: cantidadMovimiento,
      });
    }

    // Actualiza la cantidad disponible.
    await connection.query(
      'UPDATE inventario SET cantidad = ? WHERE id_inventario = ?',
      [nuevoStock, idInventario],
    );

    // Registra el historial del movimiento.
    const movimiento = await movimientoStockModel.createWithConnection(connection, {
      tipo_movimiento: tipoMovimiento,
      cantidad: cantidadMovimiento,
      fecha_movimiento: fechaMovimiento,
      observacion,
      id_usuario: idUsuario,
      id_proveedor: idProveedor,
      id_inventario: idInventario,
    });

    // Confirma los cambios si todo salio bien.
    await connection.commit();

    auditLogger.log(
      idUsuario,
      `Registrar movimiento ${tipoMovimiento}`,
      `Movimiento ${tipoMovimiento} de ${cantidadMovimiento} unidades en inventario ${idInventario}. Stock ${stockActual} -> ${nuevoStock}`,
    );

    return success(res, 201, 'Movimiento de stock registrado correctamente', {
      movimiento,
      stock_anterior: stockActual,
      stock_actual: nuevoStock,
    });
  } catch (err) {
    // Cancela los cambios si algo falla.
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
});

module.exports = {
  getAll,
  getById,
  create,
};
