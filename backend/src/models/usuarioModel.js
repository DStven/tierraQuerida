const { pool } = require('../config/db');

class UsuarioModel {
  // Lista usuarios sin mostrar la clave.
  async findAll() {
    const [rows] = await pool.query(
      `SELECT
        id_usuario,
        identificacion,
        nombre,
        email,
        telefono,
        estado,
        id_rol
      FROM usuario
      ORDER BY id_usuario DESC`,
    );

    return rows;
  }

  // Busca usuario por email para iniciar sesion.
  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT
        id_usuario,
        identificacion,
        nombre,
        email,
        clave,
        telefono,
        estado,
        id_rol
      FROM usuario
      WHERE email = ?
      LIMIT 1`,
      [email],
    );

    return rows[0] || null;
  }

  // Busca un usuario por id sin devolver la clave.
  async findById(idUsuario) {
    const [rows] = await pool.query(
      `SELECT
        id_usuario,
        identificacion,
        nombre,
        email,
        telefono,
        estado,
        id_rol
      FROM usuario
      WHERE id_usuario = ?
      LIMIT 1`,
      [idUsuario],
    );

    return rows[0] || null;
  }

  // Crea un usuario nuevo con clave ya cifrada.
  async create(usuario) {
    const [result] = await pool.query(
      `INSERT INTO usuario (
        identificacion,
        nombre,
        email,
        clave,
        telefono,
        estado,
        id_rol
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario.identificacion,
        usuario.nombre,
        usuario.email,
        usuario.clave,
        usuario.telefono,
        usuario.estado ?? 1,
        usuario.id_rol,
      ],
    );

    return this.findById(result.insertId);
  }

  // Actualiza datos del usuario.
  async update(idUsuario, usuario) {
    const [result] = await pool.query(
      'UPDATE usuario SET ? WHERE id_usuario = ?',
      [usuario, idUsuario],
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(idUsuario);
  }

  // Elimina un usuario por id.
  async delete(idUsuario) {
    const [result] = await pool.query(
      'DELETE FROM usuario WHERE id_usuario = ?',
      [idUsuario],
    );

    return result.affectedRows > 0;
  }
}

module.exports = new UsuarioModel();
