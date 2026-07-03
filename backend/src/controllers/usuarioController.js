const usuarioModel = require('../models/usuarioModel');
const rolModel = require('../models/rolModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('../utils/asyncHandler');
const { success, error } = require('../utils/apiResponse');
const auditLogger = require('../utils/auditLogger');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedRoleNames = ['administrador', 'empleado'];

// Lista todos los usuarios.
const getAll = asyncHandler(async (_req, res) => {
  const usuarios = await usuarioModel.findAll();
  success(res, 200, 'Usuarios listados correctamente', usuarios);
});

// Obtiene un usuario especifico.
const getById = asyncHandler(async (req, res) => {
  const usuario = await usuarioModel.findById(req.params.id);

  if (!usuario) {
    return error(res, 404, 'Usuario no encontrado');
  }

  return success(res, 200, 'Usuario encontrado', usuario);
});

// Crea usuario y cifra su clave.
const create = asyncHandler(async (req, res) => {
  const {
    identificacion,
    nombre,
    email,
    clave,
    telefono,
    estado,
    id_rol,
  } = req.body;

  if (!identificacion || !nombre || !email || !clave || !id_rol) {
    return error(res, 400, 'identificacion, nombre, email, clave e id_rol son obligatorios');
  }

  if (!emailRegex.test(String(email).trim())) {
    return error(res, 400, 'email invalido');
  }

  if (String(clave).length < 8) {
    return error(res, 400, 'clave debe tener minimo 8 caracteres');
  }

  // Verifica que el rol exista antes de crear el usuario.
  const rol = await rolModel.findById(id_rol);
  if (!rol) {
    return error(res, 400, 'id_rol invalido');
  }

  if (!allowedRoleNames.includes(String(rol.nombre_rol).toLowerCase())) {
    return error(res, 400, 'Solo se permite asignar roles Administrador o Empleado');
  }

  const existingUser = await usuarioModel.findByEmail(email);
  if (existingUser) {
    return error(res, 409, 'Ya existe un usuario con este email');
  }

  // La clave se guarda cifrada, nunca en texto plano.
  const hashedPassword = await bcrypt.hash(clave, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);

  // Normaliza el estado para que coincida con el enum de la base de datos.
  const normalizedEstado = (estado === 1 || estado === true || String(estado).toLowerCase() === 'activo')
    ? 'Activo'
    : 'Inactivo';

  const usuario = await usuarioModel.create({
    identificacion,
    nombre,
    email,
    clave: hashedPassword,
    telefono,
    estado: normalizedEstado,
    id_rol,
  });

  if (req.user && req.user.id_usuario) {
    auditLogger.log(req.user.id_usuario, 'Crear Usuario', `Creó usuario ${email}`);
  }

  return success(res, 201, 'Usuario creado correctamente', usuario);
});

// Actualiza usuario y cifra la clave si viene en la peticion.
const update = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  delete data.id_usuario;

  if (data.email) {
    if (!emailRegex.test(String(data.email).trim())) {
      return error(res, 400, 'email invalido');
    }

    const existingUser = await usuarioModel.findByEmail(data.email);

    if (existingUser && Number(existingUser.id_usuario) !== Number(req.params.id)) {
      return error(res, 409, 'Ya existe un usuario con este email');
    }
  }

  if (data.clave) {
    if (String(data.clave).length < 8) {
      return error(res, 400, 'clave debe tener minimo 8 caracteres');
    }

    data.clave = await bcrypt.hash(
      data.clave,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
    );
  }

  // Si se actualiza el rol, valida que exista.
  if (data.id_rol) {
    const newRol = await rolModel.findById(data.id_rol);
    if (!newRol) {
      return error(res, 400, 'id_rol invalido');
    }

    if (!allowedRoleNames.includes(String(newRol.nombre_rol).toLowerCase())) {
      return error(res, 400, 'Solo se permite asignar roles Administrador o Empleado');
    }
  }

  // Normaliza estado si viene en la peticion.
  if (Object.prototype.hasOwnProperty.call(data, 'estado')) {
    data.estado = (data.estado === 1 || data.estado === true || String(data.estado).toLowerCase() === 'activo')
      ? 'Activo'
      : 'Inactivo';
  }

  const usuario = await usuarioModel.update(req.params.id, data);

  if (!usuario) {
    return error(res, 404, 'Usuario no encontrado');
  }

  if (req.user && req.user.id_usuario) {
    auditLogger.log(req.user.id_usuario, 'Actualizar Usuario', `Actualizó usuario id ${req.params.id}`);
  }

  return success(res, 200, 'Usuario actualizado correctamente', usuario);
});

// Elimina un usuario.
const remove = asyncHandler(async (req, res) => {
  const deleted = await usuarioModel.delete(req.params.id);

  if (!deleted) {
    return error(res, 404, 'Usuario no encontrado');
  }

  if (req.user && req.user.id_usuario) {
    auditLogger.log(req.user.id_usuario, 'Eliminar Usuario', `Eliminó usuario id ${req.params.id}`);
  }

  return success(res, 200, 'Usuario eliminado correctamente');
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
