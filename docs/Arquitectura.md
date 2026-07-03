# Arquitectura - Tierra Querida

## 1. Estilo Arquitectonico
Arquitectura modular en capas:

- Capa de Presentacion: Angular SPA
- Capa de Aplicacion/API: Express REST
- Capa de Datos: MySQL

## 2. Frontend (Angular)
### 2.1 Modulos funcionales
- Dashboard
- Usuarios
- Proveedores
- Categorias
- Productos
- Inventario
- Movimientos
- Auditoria

### 2.2 Capas internas
- `core`: contratos, servicios y seguridad
- `features`: casos de uso visuales
- `shared`: componentes reutilizables y utilidades
- `layouts`: shell principal autenticado

## 3. Backend (Express)
### 3.1 Componentes
- `routes`: mapeo de endpoints
- `controllers`: reglas de aplicacion por caso de uso
- `models`: acceso a datos SQL
- `middleware`: seguridad y autorizacion
- `utils`: respuestas, auditoria y utilidades async

### 3.2 Seguridad
- JWT en rutas protegidas
- Autorizacion por rol con middleware dedicado
- Segmentacion de permisos entre Administrador y Empleado

## 4. Datos (MySQL)
- Modelo relacional con llaves foraneas entre catalogos, usuarios, proveedores e inventario.
- Persistencia transaccional para operaciones sensibles de movimiento de stock.

## 5. Flujo tecnico simplificado
1. Usuario autentica en frontend.
2. Frontend consume API REST con token.
3. Middleware valida token y rol.
4. Controller procesa caso de uso.
5. Model ejecuta consulta SQL.
6. API responde en formato estandarizado.

## 6. Principios aplicados
- Separacion de responsabilidades
- Modularidad por dominio
- Reutilizacion de componentes en frontend
- Convenciones de respuesta unificadas
- Restriccion de acceso por rol

## 7. Limites del sistema
- Sin microservicios.
- Sin colas/eventos externos.
- Sin capa de cache dedicada.
- Despliegue monolitico (frontend + backend separados por carpeta).
