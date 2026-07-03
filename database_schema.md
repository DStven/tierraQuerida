CREATE DATABASE tierraQuerida_db;
USE tierraQuerida_db;

-- roles
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(150)
);

-- usuarios
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    identificacion VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    clave VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    estado ENUM('Activo','Inactivo') DEFAULT 'Activo',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,

    FOREIGN KEY (id_rol)
    REFERENCES rol(id_rol)
);

-- departamentos
CREATE TABLE departamento (
    id_dpto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- ciudades
CREATE TABLE ciudad (
    id_ciudad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_dpto INT NOT NULL,

    FOREIGN KEY (id_dpto)
    REFERENCES departamento(id_dpto)
);

-- proveedores
CREATE TABLE proveedor (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nit VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(100) NOT NULL,
    direccion VARCHAR(150),
    email VARCHAR(100),
    telefono VARCHAR(15),
    id_ciudad INT NOT NULL,

    FOREIGN KEY (id_ciudad)
    REFERENCES ciudad(id_ciudad)
);

-- categorias
CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL UNIQUE
);

-- inventario
CREATE TABLE inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    producto VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL,
    stock_minimo INT NOT NULL,
    unidad_medida VARCHAR(20),
    precio_unitario DECIMAL(10,2),
    estado ENUM('Disponible','Agotado') DEFAULT 'Disponible',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    id_categoria INT NOT NULL,

    FOREIGN KEY (id_categoria)
    REFERENCES categoria(id_categoria)
);

-- movimiento de stock
CREATE TABLE movimiento_stock (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,

    tipo_movimiento ENUM('Entrada','Salida') NOT NULL,

    cantidad INT NOT NULL,

    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,

    observacion VARCHAR(255),

    id_usuario INT NOT NULL,

    id_proveedor INT,

    id_inventario INT NOT NULL,

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id_usuario),

    FOREIGN KEY (id_proveedor)
    REFERENCES proveedor(id_proveedor),

    FOREIGN KEY (id_inventario)
    REFERENCES inventario(id_inventario)
);