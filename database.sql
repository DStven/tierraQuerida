CREATE DATABASE tierraQuerida_db;
USE tierraQuerida_db;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE rol (
  id_rol INT(11) NOT NULL AUTO_INCREMENT,
  nombre_rol VARCHAR(50) NOT NULL,
  descripcion VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_rol_nombre (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE departamento (
  id_dpto INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_dpto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ciudad (
  id_ciudad INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  id_dpto INT(11) NOT NULL,
  PRIMARY KEY (id_ciudad),
  KEY idx_ciudad_dpto (id_dpto),
  CONSTRAINT fk_ciudad_departamento
    FOREIGN KEY (id_dpto) REFERENCES departamento(id_dpto)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categoria (
  id_categoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_categoria_nombre (nombre_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE producto (
  id_producto INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) DEFAULT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  precio_unitario DECIMAL(10,2) DEFAULT NULL,
  id_categoria INT(11) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  KEY idx_producto_categoria (id_categoria),
  KEY idx_producto_nombre (nombre),
  CONSTRAINT fk_producto_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventario (
  id_inventario INT(11) NOT NULL AUTO_INCREMENT,
  producto VARCHAR(100) DEFAULT NULL,
  cantidad INT(11) NOT NULL DEFAULT 0,
  stock_minimo INT(11) NOT NULL DEFAULT 0,
  unidad_medida VARCHAR(20) DEFAULT NULL,
  precio_unitario DECIMAL(10,2) DEFAULT NULL,
  estado ENUM('Disponible','Agotado') DEFAULT 'Disponible',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_categoria INT(11) NOT NULL,
  id_producto INT(11) DEFAULT NULL,
  PRIMARY KEY (id_inventario),
  KEY idx_inventario_categoria (id_categoria),
  CONSTRAINT fk_inventario_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE proveedor (
  id_proveedor INT(11) NOT NULL AUTO_INCREMENT,
  nit VARCHAR(20) NOT NULL,
  razon_social VARCHAR(100) NOT NULL,
  direccion VARCHAR(150) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  telefono VARCHAR(15) DEFAULT NULL,
  id_ciudad INT(11) NOT NULL,
  PRIMARY KEY (id_proveedor),
  UNIQUE KEY uq_proveedor_nit (nit),
  KEY idx_proveedor_ciudad (id_ciudad),
  CONSTRAINT fk_proveedor_ciudad
    FOREIGN KEY (id_ciudad) REFERENCES ciudad(id_ciudad)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  identificacion VARCHAR(20) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  clave VARCHAR(255) NOT NULL,
  telefono VARCHAR(15) DEFAULT NULL,
  estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_rol INT(11) NOT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_identificacion (identificacion),
  UNIQUE KEY uq_usuario_email (email),
  KEY idx_usuario_rol (id_rol),
  CONSTRAINT fk_usuario_rol
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE proveedor_producto (
  id_proveedor INT(11) NOT NULL,
  id_producto INT(11) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_proveedor, id_producto),
  KEY idx_pp_producto (id_producto),
  CONSTRAINT fk_pp_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_pp_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE movimiento_stock (
  id_movimiento INT(11) NOT NULL AUTO_INCREMENT,
  tipo_movimiento ENUM('Entrada','Salida') NOT NULL,
  cantidad INT(11) NOT NULL,
  fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
  observacion VARCHAR(255) DEFAULT NULL,
  id_usuario INT(11) NOT NULL,
  id_proveedor INT(11) DEFAULT NULL,
  id_inventario INT(11) NOT NULL,
  PRIMARY KEY (id_movimiento),
  KEY idx_mov_usuario (id_usuario),
  KEY idx_mov_proveedor (id_proveedor),
  KEY idx_mov_inventario (id_inventario),
  CONSTRAINT fk_mov_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT fk_mov_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT fk_mov_inventario
    FOREIGN KEY (id_inventario) REFERENCES inventario(id_inventario)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auditoria (
  id_auditoria INT(11) NOT NULL AUTO_INCREMENT,
  accion VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_usuario INT(11) DEFAULT NULL,
  PRIMARY KEY (id_auditoria),
  KEY idx_auditoria_fecha (fecha),
  KEY idx_auditoria_accion (accion),
  KEY idx_auditoria_usuario (id_usuario),
  CONSTRAINT fk_auditoria_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rol (nombre_rol, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema'),
  ('Empleado', 'Acceso operativo restringido');

INSERT INTO departamento (nombre) VALUES
  ('Antioquia'),
  ('Cundinamarca'),
  ('Valle del Cauca'),
  ('Atlántico'),
  ('Santander');

INSERT INTO ciudad (nombre, id_dpto) VALUES
  ('Medellín', 1),
  ('Bogotá D.C.', 2),
  ('Cali', 3),
  ('Barranquilla', 4),
  ('Bucaramanga', 5);

INSERT INTO categoria (nombre_categoria) VALUES
  ('Carnes'),
  ('Lácteos'),
  ('Verduras'),
  ('Salsas'),
  ('Papas'),
  ('Bebidas'),
  ('Empaques'),
  ('Panadería');
