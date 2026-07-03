const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexiones para reutilizar conexiones a MySQL.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
});

// Verifica que la base de datos responda al iniciar el servidor.
const checkConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('Conexion a MySQL establecida correctamente');
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  checkConnection,
};
