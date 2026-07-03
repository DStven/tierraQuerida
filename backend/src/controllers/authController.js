const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');

// Quita la clave antes de responder al cliente.
const removeSensitiveFields = (usuario) => {
  const sanitized = { ...usuario };
  delete sanitized.clave;
  return sanitized;
};

// Crea el token que identifica al usuario autenticado.
const buildToken = (usuario) => {
  const payload = {
    id_usuario: usuario.id_usuario,
    email: usuario.email,
    id_rol: usuario.id_rol,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
};

// Inicia sesion con email y clave.
const login = asyncHandler(async (req, res) => {
  const { email, clave } = req.body;

  if (!email || !clave) {
    return error(res, 400, 'Email y clave son obligatorios');
  }

  const usuario = await usuarioModel.findByEmail(email);
  if (!usuario) {
    return error(res, 401, 'Credenciales invalidas');
  }

  // Evita que usuarios inactivos usen el sistema.
  const isActive = usuario.estado === 1
    || usuario.estado === true
    || String(usuario.estado).toLowerCase() === 'activo';
  if (!isActive) {
    return error(res, 403, 'Usuario inactivo');
  }
  

  // Compara la clave enviada con la clave cifrada guardada.
  const passwordMatches = await bcrypt.compare(clave, usuario.clave);

  if (!passwordMatches) {
    return error(res, 401, 'Credenciales invalidas');
  }

  const token = buildToken(usuario);

  success(res, 200, 'Inicio de sesion correcto', {
    usuario: removeSensitiveFields(usuario),
    token,
  });
});

const verifyTokenIgnoreExpiration = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
  } catch (_err) {
    return null;
  }
};

const refreshToken = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return error(res, 401, 'Token de autenticación requerido');
  }

  const decoded = verifyTokenIgnoreExpiration(token);
  if (!decoded || !decoded.id_usuario) {
    return error(res, 401, 'Token inválido');
  }

  const usuario = await usuarioModel.findById(decoded.id_usuario);
  if (!usuario) {
    return error(res, 404, 'Usuario no encontrado');
  }

  const newToken = buildToken(usuario);
  success(res, 200, 'Token renovado correctamente', { token: newToken });
});

// Devuelve los datos del usuario autenticado.
const perfil = asyncHandler(async (req, res) => {
  const usuario = await usuarioModel.findById(req.user.id_usuario);

  if (!usuario) {
    return error(res, 404, 'Usuario no encontrado');
  }

  success(res, 200, 'Perfil obtenido correctamente', removeSensitiveFields(usuario));
});

module.exports = {
  login,
  perfil,
  refreshToken,
};
