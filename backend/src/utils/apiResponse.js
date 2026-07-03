// Respuesta para operaciones exitosas.
const success = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    ok: true,
    message,
    data,
  });
};

// Respuesta para errores controlados.
const error = (res, statusCode, message, details = null) => {
  res.status(statusCode).json({
    ok: false,
    message,
    details,
  });
};

module.exports = {
  success,
  error,
};
