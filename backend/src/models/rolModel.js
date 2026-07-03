const { pool } = require('../config/db');

class RolModel {
  // Busca un rol por su identificador.
  async findById(idRol) {
    const [rows] = await pool.query(
      `SELECT
        id_rol,
        nombre_rol
      FROM rol
      WHERE id_rol = ?
      LIMIT 1`,
      [idRol],
    );

    return rows[0] || null;
  }
}

module.exports = new RolModel();
