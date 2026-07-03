# API - Tierra Querida

Base URL local por defecto: `http://localhost:3000`

## Formato de respuesta
### Exito
```json
{
  "ok": true,
  "message": "Operacion exitosa",
  "data": {}
}
```

### Error
```json
{
  "ok": false,
  "message": "Descripcion del error",
  "details": null
}
```

## Convenciones de autenticacion
- Publico: no requiere token.
- JWT: requiere header `Authorization: Bearer <token>`.
- JWT + Rol: requiere token y rol autorizado.

## Endpoints
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | / | Healthcheck de API | Publico | Mensaje de API activa |
| POST | /login | Iniciar sesion | Publico | Usuario autenticado + token |
| GET | /refresh | Renovar token | JWT | Nuevo token |
| GET | /perfil | Perfil del usuario autenticado | JWT | Datos de usuario |

### Usuarios
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /usuarios | Listar usuarios | JWT + Rol Administrador | Lista de usuarios |
| GET | /usuarios/:id | Obtener usuario por id | JWT + Rol Administrador | Usuario |
| POST | /usuarios | Crear usuario | JWT + Rol Administrador | Usuario creado |
| PUT | /usuarios/:id | Actualizar usuario | JWT + Rol Administrador | Usuario actualizado |
| DELETE | /usuarios/:id | Eliminar usuario | JWT + Rol Administrador | Confirmacion |

### Roles
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /roles | Listar roles | JWT | Lista de roles |
| GET | /roles/:id | Obtener rol por id | JWT | Rol |
| POST | /roles | Crear rol | JWT | Rol creado |
| PUT | /roles/:id | Actualizar rol | JWT | Rol actualizado |
| DELETE | /roles/:id | Eliminar rol | JWT | Confirmacion |

### Proveedores
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /proveedores | Listar proveedores | JWT + Rol Administrador/Empleado | Lista de proveedores |
| GET | /proveedores/:id | Obtener proveedor por id | JWT + Rol Administrador/Empleado | Proveedor |
| POST | /proveedores | Crear proveedor | JWT + Rol Administrador | Proveedor creado |
| PUT | /proveedores/:id | Actualizar proveedor | JWT + Rol Administrador | Proveedor actualizado |
| DELETE | /proveedores/:id | Eliminar proveedor | JWT + Rol Administrador | Confirmacion |

### Proveedor-Producto
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /proveedor-producto | Listar relaciones proveedor-producto | JWT + Rol Administrador/Empleado | Lista de relaciones |
| POST | /proveedor-producto | Crear relacion proveedor-producto | JWT + Rol Administrador | Relacion creada |
| DELETE | /proveedor-producto/:id | Eliminar relacion proveedor-producto | JWT + Rol Administrador | Confirmacion |

### Departamentos
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /departamentos | Listar departamentos | JWT | Lista de departamentos |
| GET | /departamentos/:id | Obtener departamento por id | JWT | Departamento |
| POST | /departamentos | Crear departamento | JWT | Departamento creado |
| PUT | /departamentos/:id | Actualizar departamento | JWT | Departamento actualizado |
| DELETE | /departamentos/:id | Eliminar departamento | JWT | Confirmacion |

### Ciudades
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /ciudades | Listar ciudades | JWT | Lista de ciudades |
| GET | /ciudades/:id | Obtener ciudad por id | JWT | Ciudad |
| POST | /ciudades | Crear ciudad | JWT | Ciudad creada |
| PUT | /ciudades/:id | Actualizar ciudad | JWT | Ciudad actualizada |
| DELETE | /ciudades/:id | Eliminar ciudad | JWT | Confirmacion |

### Categorias
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /categorias | Listar categorias | JWT | Lista de categorias |
| GET | /categorias/:id | Obtener categoria por id | JWT | Categoria |
| POST | /categorias | Crear categoria | JWT | Categoria creada |
| PUT | /categorias/:id | Actualizar categoria | JWT | Categoria actualizada |
| DELETE | /categorias/:id | Eliminar categoria | JWT | Confirmacion |

### Productos
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /productos | Listar productos | JWT + Rol Administrador/Empleado | Lista de productos |
| GET | /productos/:id | Obtener producto por id | JWT + Rol Administrador/Empleado | Producto |
| POST | /productos | Crear producto | JWT + Rol Administrador | Producto creado |
| PUT | /productos/:id | Actualizar producto | JWT + Rol Administrador | Producto actualizado |
| DELETE | /productos/:id | Eliminar producto | JWT + Rol Administrador | Confirmacion |

### Inventario
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /inventario | Listar inventario | JWT + Rol Administrador/Empleado | Lista de inventario |
| GET | /inventario/:id | Obtener inventario por id | JWT + Rol Administrador/Empleado | Item inventario |
| POST | /inventario | Crear registro de inventario | JWT + Rol Administrador | Registro creado |
| PUT | /inventario/:id | Actualizar registro de inventario | JWT + Rol Administrador | Registro actualizado |
| DELETE | /inventario/:id | Eliminar registro de inventario | JWT + Rol Administrador | Confirmacion |

### Movimientos
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /movimientos | Listar historial de movimientos | JWT + Rol Administrador | Lista de movimientos |
| GET | /movimientos/:id | Obtener movimiento por id | JWT + Rol Administrador | Movimiento |
| POST | /movimientos | Registrar entrada/salida | JWT + Rol Administrador/Empleado | Movimiento creado |

### Auditorias
| Metodo | Endpoint | Descripcion | Autenticacion requerida | Respuesta |
|---|---|---|---|---|
| GET | /auditorias | Listar auditorias | JWT + Rol Administrador | Lista de auditorias |
| GET | /auditorias/:id | Obtener auditoria por id | JWT + Rol Administrador | Auditoria |

## Notas
- Los nombres de campos exactos dependen del recurso y su controlador.
- En errores de autorizacion se usan codigos 401 (no autenticado) o 403 (sin permisos).
- En recursos no encontrados se responde con 404.
