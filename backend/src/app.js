const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { checkConnection } = require('./config/db');
const { error } = require('./utils/apiResponse');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const departamentoRoutes = require('./routes/departamentoRoutes');
const ciudadRoutes = require('./routes/ciudadRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const movimientoStockRoutes = require('./routes/movimientoStockRoutes');
const productoRoutes = require('./routes/productoRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');
const proveedorProductoRoutes = require('./routes/proveedorProductoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares generales de la aplicacion.
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta simple para comprobar que la API esta activa.
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'API Tierra Querida funcionando correctamente',
  });
});

// Rutas principales del backend.
app.use('/', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/roles', rolRoutes);
app.use('/proveedores', proveedorRoutes);
app.use('/departamentos', departamentoRoutes);
app.use('/ciudades', ciudadRoutes);
app.use('/categorias', categoriaRoutes);
app.use('/inventario', inventarioRoutes);
app.use('/movimientos', movimientoStockRoutes);
app.use('/productos', productoRoutes);
app.use('/auditorias', auditoriaRoutes);
app.use('/proveedor-producto', proveedorProductoRoutes);

// Maneja rutas que no existen.
app.use((_req, res) => {
  error(res, 404, 'Ruta no encontrada');
});

// Maneja errores generales del servidor.
app.use((err, _req, res, _next) => {
  console.error(err);
  error(
    res,
    err.status || 500,
    'Error interno del servidor',
    process.env.NODE_ENV === 'development' ? err.message : null,
  );
});

// Inicia servidor 
const startServer = async () => {
  try {
    await checkConnection();
    app.listen(PORT, () => {
      console.log(`Servidor Tierra Querida ejecutandose en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
