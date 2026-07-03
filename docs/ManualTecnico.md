# Manual Tecnico - Tierra Querida

## 1. Vision General
Tierra Querida es una aplicacion web full stack compuesta por un backend REST en Node.js/Express y un frontend SPA en Angular.

## 2. Backend
### 2.1 Stack
- Node.js
- Express
- mysql2
- JWT
- bcrypt

### 2.2 Estructura principal
- `backend/src/app.js`: bootstrap del servidor y registro de rutas.
- `backend/src/config/db.js`: configuracion del pool MySQL.
- `backend/src/routes/`: definicion de endpoints por recurso.
- `backend/src/controllers/`: logica de casos de uso por recurso.
- `backend/src/models/`: acceso a datos.
- `backend/src/middleware/`: autenticacion y autorizacion.
- `backend/src/utils/`: helpers transversales.

### 2.3 Controladores
- `authController`: login, refresh de token, perfil.
- `usuarioController`, `rolController`.
- `proveedorController`, `proveedorProductoController`.
- `categoriaController`, `productoController`.
- `inventarioController`, `movimientoStockController`.
- `departamentoController`, `ciudadController`.
- `auditoriaController`.

### 2.4 Modelos
- `baseModel`: operaciones CRUD genericas.
- `resourceModels`: mapeo de modelos base por tabla.
- `inventarioModel`: consultas especificas de inventario.
- `movimientoStockModel`: operaciones de movimientos.
- `usuarioModel`, `rolModel`: autenticacion y permisos.

## 3. Frontend
### 3.1 Stack
- Angular 21 standalone
- TypeScript
- Tailwind CSS
- Chart.js

### 3.2 Estructura principal
- `frontend/src/app/core/`: servicios, guards, modelos, interceptores.
- `frontend/src/app/features/`: vistas por modulo.
- `frontend/src/app/layouts/`: estructura principal autenticada.
- `frontend/src/app/shared/`: componentes reutilizables y utilidades.

### 3.3 Servicios principales
- `auth.service.ts`: sesion y perfil.
- `api.service.ts`: wrapper HTTP base.
- Servicios de dominio: usuario, rol, proveedor, categoria, producto, inventario, movimiento, auditoria.

### 3.4 Componentes principales
- Login
- Dashboard
- Modulos funcionales (usuarios, proveedores, categorias, productos, inventario, movimientos, auditoria)
- Componentes compartidos (paginacion, modal de confirmacion, toasts, estados vacios, etc.)

## 4. Base de Datos
### 4.1 Motor
- MySQL

### 4.2 Tablas funcionales (segun esquema del proyecto)
- `rol`
- `usuario`
- `departamento`
- `ciudad`
- `proveedor`
- `categoria`
- `inventario`
- `movimiento_stock`

### 4.3 Tablas usadas por backend
- El backend tambien referencia `producto`, `auditoria` y `proveedor_producto` en rutas/controladores/modelos.

## 5. Autenticacion y Autorizacion
### 5.1 Flujo
1. Cliente envia credenciales a `/login`.
2. Backend valida credenciales y estado del usuario.
3. Se emite JWT con `id_usuario`, `email`, `id_rol`.
4. Frontend adjunta token en peticiones protegidas.

### 5.2 Middlewares
- `authMiddleware`: valida token.
- `roleMiddleware`: valida permisos por rol (`Administrador`/`Empleado`).

## 6. Formato de respuesta API
- Exito:
```json
{
  "ok": true,
  "message": "...",
  "data": {}
}
```
- Error:
```json
{
  "ok": false,
  "message": "...",
  "details": null
}
```

## 7. Flujo del Sistema (alto nivel)
1. Autenticacion de usuario.
2. Carga de datos iniciales por modulo.
3. Operaciones CRUD segun permisos.
4. Registro de movimientos y actualizacion de stock.
5. Visualizacion de indicadores en dashboard.
6. Consulta de trazabilidad en auditoria.

## 8. Variables de Entorno (backend)
- `PORT`
- `CORS_ORIGIN`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_CONNECTION_LIMIT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
