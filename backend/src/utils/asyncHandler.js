// Evita repetir try/catch en cada controlador.
const asyncHandler = (controller) => (req, res, next) => {
  Promise.resolve(controller(req, res, next)).catch(next);
};

module.exports = asyncHandler;
