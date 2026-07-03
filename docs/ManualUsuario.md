# Manual de Usuario - Tierra Querida

## 1. Acceso (Login)
1. Ingrese al sistema desde la ruta `/login`.
2. Digite correo y contrasena.
3. Presione "Entrar al panel".
4. Si las credenciales son validas, sera redirigido al Dashboard.

## 2. Dashboard
- Muestra indicadores generales de inventario y actividad.
- Incluye tarjetas, graficas y accesos rapidos.
- Permite refrescar datos desde el boton de actualizacion.
- Usuarios Administrador visualizan mas informacion de control y auditoria.

## 3. Usuarios (Solo Administrador)
- Ruta: `/usuarios`
- Permite:
  - Crear usuario
  - Editar usuario
  - Eliminar usuario
  - Buscar y paginar resultados
- Campos clave: identificacion, nombre, email, clave, estado y rol.

## 4. Productos (Solo Administrador)
- Ruta: `/productos`
- Permite:
  - Registrar productos
  - Actualizar productos
  - Eliminar productos
  - Buscar por nombre/descripcion/precio/categoria
- Cada producto se relaciona con una categoria.

## 5. Categorias
- Ruta: `/categorias`
- Permite crear, editar y eliminar categorias.
- Se usan para clasificar productos e inventario.

## 6. Inventario
- Ruta: `/inventario`
- Permite consultar niveles de stock y estado por producto.
- Incluye filtros por estado y categoria.
- Administrador puede crear/editar/eliminar registros de inventario.
- Muestra alertas de stock bajo.

## 7. Movimientos
- Ruta: `/movimientos`
- Permite registrar entradas y salidas de stock.
- Campos principales: tipo, categoria, producto, cantidad, fecha, observacion y proveedor opcional.
- Historial completo disponible para Administrador.

## 8. Auditoria (Solo Administrador)
- Ruta: `/auditoria`
- Muestra acciones registradas en el sistema.
- Incluye filtros de busqueda y paginacion.
- Facilita trazabilidad operativa.

## 9. Proveedores
- Ruta: `/proveedores`
- Permite consultar, crear, editar, eliminar y ver detalle de proveedores (segun rol).
- Incluye filtrado por ciudad/departamento y busqueda por razon social, NIT y contacto.

## 10. Cierre de sesion
- Disponible desde el menu de usuario en la parte superior.
- Solicita confirmacion antes de cerrar sesion.

## 11. Roles y permisos (resumen)
- Administrador:
  - Acceso total al sistema
  - Gestion de usuarios y auditoria
  - Gestion de catalogos y operaciones
- Empleado:
  - Acceso operativo limitado
  - Consulta y registro de movimientos permitidos

## 12. Mensajes del sistema
- Exito: operacion completada
- Error: validacion o fallo de servidor
- Advertencia: accion sensible (por ejemplo eliminar)
- Informacion: estado general de proceso
