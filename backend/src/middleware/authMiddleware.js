const jwt = require('jsonwebtoken');
const { error } = require('../utils/apiResponse');

// Valida que la peticion tenga un token JWT valido.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // El token debe llegar como: Bearer token.
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return error(res, 401, 'Token de autenticacion requerido');
  }

  try {
    // Guarda los datos del token para usarlos en rutas protegidas.
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (_err) {
    return error(res, 401, 'Token invalido o expirado');
  }
};

module.exports = authMiddleware;
