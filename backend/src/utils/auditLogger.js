const { pool } = require('../config/db');

const log = async (id_usuario, accion, descripcion) => {
  try {
    await pool.query('INSERT INTO auditoria (accion, descripcion, id_usuario) VALUES (?, ?, ?)', [accion, descripcion, id_usuario || null]);
  } catch (err) {
    // No romper la aplicacion por fallos en auditoria; solo loguear en consola.
    console.error('Audit log failed:', err.message);
  }
};

module.exports = { log };
