const { pool } = require('../config/db');

class InventarioModel {
  // Lista todos los productos del inventario con datos de producto y categoría.
  async findAll() {
    const [rows] = await pool.query(
      `SELECT
        inventario.id_inventario,
        inventario.producto,
        inventario.cantidad,
        inventario.stock_minimo,
        inventario.unidad_medida,
        COALESCE(producto.precio_unitario, inventario.precio_unitario) AS precio_unitario,
        inventario.estado,
        inventario.fecha_registro,
        inventario.id_categoria,
        producto.id_producto,
        categoria.nombre_categoria
      FROM inventario
      LEFT JOIN producto
        ON inventario.producto = producto.nombre
        AND inventario.id_categoria = producto.id_categoria
      LEFT JOIN categoria
        ON producto.id_categoria = categoria.id_categoria
      ORDER BY inventario.id_inventario DESC`,
    );

    return rows;
  }

  // Busca un producto por id.
  async findById(idInventario) {
    const [rows] = await pool.query(
      `SELECT
        inventario.id_inventario,
        inventario.producto,
        inventario.cantidad,
        inventario.stock_minimo,
        inventario.unidad_medida,
        COALESCE(producto.precio_unitario, inventario.precio_unitario) AS precio_unitario,
        inventario.estado,
        inventario.fecha_registro,
        inventario.id_categoria,
        producto.id_producto,
        categoria.nombre_categoria
      FROM inventario
      LEFT JOIN producto
        ON inventario.producto = producto.nombre
        AND inventario.id_categoria = producto.id_categoria
      LEFT JOIN categoria
        ON producto.id_categoria = categoria.id_categoria
      WHERE inventario.id_inventario = ?
      LIMIT 1`,
      [idInventario],
    );

    return rows[0] || null;
  }

  // Busca un producto por nombre y categoría.
  async findByProducto(producto, idCategoria) {
    const [rows] = await pool.query(
      `SELECT
        id_inventario,
        producto,
        cantidad,
        stock_minimo,
        unidad_medida,
        precio_unitario,
        estado,
        fecha_registro,
        id_categoria
      FROM inventario
      WHERE producto = ?
        AND id_categoria = ?
      LIMIT 1`,
      [producto, idCategoria],
    );

    return rows[0] || null;
  }

  // Crea un producto en inventario.
  async create(inventario) {
    const [result] = await pool.query(
      `INSERT INTO inventario (
        producto,
        cantidad,
        stock_minimo,
        unidad_medida,
        precio_unitario,
        estado,
        fecha_registro,
        id_categoria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inventario.producto,
        inventario.cantidad,
        inventario.stock_minimo,
        inventario.unidad_medida,
        inventario.precio_unitario,
        inventario.estado ?? 1,
        inventario.fecha_registro,
        inventario.id_categoria,
      ],
    );

    return this.findById(result.insertId);
  }

  // Actualiza todos los datos principales del producto.
  async update(idInventario, inventario) {
    const [result] = await pool.query(
      `UPDATE inventario
      SET
        producto = ?,
        cantidad = ?,
        stock_minimo = ?,
        unidad_medida = ?,
        precio_unitario = ?,
        estado = ?,
        fecha_registro = ?,
        id_categoria = ?
      WHERE id_inventario = ?`,
      [
        inventario.producto,
        inventario.cantidad,
        inventario.stock_minimo,
        inventario.unidad_medida,
        inventario.precio_unitario,
        inventario.estado,
        inventario.fecha_registro,
        inventario.id_categoria,
        idInventario,
      ],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(idInventario);
  }

  // Elimina un producto del inventario.
  async delete(idInventario) {
    const [result] = await pool.query(
      'DELETE FROM inventario WHERE id_inventario = ?',
      [idInventario],
    );

    return result.affectedRows > 0;
  }
}

module.exports = new InventarioModel();
