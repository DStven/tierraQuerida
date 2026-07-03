const { error } = require('../utils/apiResponse');
const rolModel = require('../models/rolModel');

// Normaliza el texto para comparar roles sin depender de mayusculas.
const normalizeRole = (roleName) => roleName.trim().toLowerCase();

// Revisa si el rol del usuario tiene permiso para entrar.
const roleMiddleware = (...allowedRoles) => async (req, res, next) => {
  if (!req.user) {
    return error(res, 401, 'Usuario no autenticado');
  }

  if (!req.user.id_rol) {
    return error(res, 403, 'El token no contiene rol de usuario');
  }

  try {
    // Busca el nombre del rol usando el id que viene en el token.
    const rol = await rolModel.findById(req.user.id_rol);

    if (!rol) {
      return error(res, 403, 'Rol no encontrado');
    }

    const allowed = allowedRoles.map(normalizeRole);
    const currentRole = normalizeRole(rol.nombre_rol);

    // Si el rol no esta permitido, bloquea la accion.
    if (!allowed.includes(currentRole)) {
      return error(res, 403, 'No tienes permisos para realizar esta accion');
    }

    req.user.rol = rol.nombre_rol;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = roleMiddleware;
