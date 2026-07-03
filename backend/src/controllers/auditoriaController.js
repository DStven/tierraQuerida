const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

// Lista auditoria con usuario asociado, primero los registros mas recientes.
const getAll = asyncHandler(async (_req, res) => {
	const [rows] = await pool.query(
		`SELECT
			a.id_auditoria,
			a.accion,
			a.descripcion,
			a.fecha,
			a.id_usuario,
			u.nombre AS usuario_nombre
		FROM auditoria a
		LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
		ORDER BY a.fecha DESC, a.id_auditoria DESC`,
	);

	success(res, 200, 'Auditoria listada correctamente', rows);
});

// Obtiene un registro de auditoria por id.
const getById = asyncHandler(async (req, res) => {
	const [rows] = await pool.query(
		`SELECT
			a.id_auditoria,
			a.accion,
			a.descripcion,
			a.fecha,
			a.id_usuario,
			u.nombre AS usuario_nombre
		FROM auditoria a
		LEFT JOIN usuario u ON u.id_usuario = a.id_usuario
		WHERE a.id_auditoria = ?
		LIMIT 1`,
		[req.params.id],
	);

	const row = rows[0] || null;
	if (!row) {
		return error(res, 404, 'Auditoria no encontrada');
	}

	return success(res, 200, 'Auditoria encontrada', row);
});

module.exports = {
	getAll,
	getById,
};
