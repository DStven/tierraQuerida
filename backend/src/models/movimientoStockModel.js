const { pool } = require('../config/db');

class MovimientoStockModel {
  // Lista los movimientos registrados.
  async findAll() {
    const [rows] = await pool.query(
      `SELECT
        id_movimiento,
        tipo_movimiento,
        cantidad,
        fecha_movimiento,
        observacion,
        id_usuario,
        id_proveedor,
        id_inventario
      FROM movimiento_stock
      ORDER BY fecha_movimiento DESC, id_movimiento DESC`,
    );

    return rows;
  }

  // Busca un movimiento por id.
  async findById(idMovimiento) {
    const [rows] = await pool.query(
      `SELECT
        id_movimiento,
        tipo_movimiento,
        cantidad,
        fecha_movimiento,
        observacion,
        id_usuario,
        id_proveedor,
        id_inventario
      FROM movimiento_stock
      WHERE id_movimiento = ?
      LIMIT 1`,
      [idMovimiento],
    );

    return rows[0] || null;
  }

  // Crea un movimiento usando la misma transaccion del controlador.
  async createWithConnection(connection, movimiento) {
    const [result] = await connection.query(
      `INSERT INTO movimiento_stock (
        tipo_movimiento,
        cantidad,
        fecha_movimiento,
        observacion,
        id_usuario,
        id_proveedor,
        id_inventario
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        movimiento.tipo_movimiento,
        movimiento.cantidad,
        movimiento.fecha_movimiento,
        movimiento.observacion,
        movimiento.id_usuario,
        movimiento.id_proveedor,
        movimiento.id_inventario,
      ],
    );

    const [rows] = await connection.query(
      `SELECT
        id_movimiento,
        tipo_movimiento,
        cantidad,
        fecha_movimiento,
        observacion,
        id_usuario,
        id_proveedor,
        id_inventario
      FROM movimiento_stock
      WHERE id_movimiento = ?
      LIMIT 1`,
      [result.insertId],
    );

    return rows[0] || null;
  }
}

module.exports = new MovimientoStockModel();
