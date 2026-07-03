# Estructura del Proyecto - Tierra Querida

```text
tierraQueridaProject/
|- .gitignore
|- README.md
|- CHANGELOG.md
|- LICENSE
|- database_schema.md
|- backend/
|  |- package.json
|  `- src/
|     |- app.js
|     |- config/
|     |  `- db.js
|     |- controllers/
|     |  |- auditoriaController.js
|     |  |- authController.js
|     |  |- categoriaController.js
|     |  |- ciudadController.js
|     |  |- crudControllerFactory.js
|     |  |- departamentoController.js
|     |  |- inventarioController.js
|     |  |- movimientoStockController.js
|     |  |- productoController.js
|     |  |- proveedorController.js
|     |  |- proveedorProductoController.js
|     |  |- rolController.js
|     |  `- usuarioController.js
|     |- middleware/
|     |  |- authMiddleware.js
|     |  `- roleMiddleware.js
|     |- models/
|     |  |- baseModel.js
|     |  |- inventarioModel.js
|     |  |- movimientoStockModel.js
|     |  |- resourceModels.js
|     |  |- rolModel.js
|     |  `- usuarioModel.js
|     |- routes/
|     |  |- auditoriaRoutes.js
|     |  |- authRoutes.js
|     |  |- categoriaRoutes.js
|     |  |- ciudadRoutes.js
|     |  |- departamentoRoutes.js
|     |  |- inventarioRoutes.js
|     |  |- movimientoStockRoutes.js
|     |  |- productoRoutes.js
|     |  |- proveedorProductoRoutes.js
|     |  |- proveedorRoutes.js
|     |  |- rolRoutes.js
|     |  `- usuarioRoutes.js
|     `- utils/
|        |- apiResponse.js
|        |- asyncHandler.js
|        `- auditLogger.js
|- frontend/
|  |- package.json
|  |- angular.json
|  |- tsconfig.json
|  |- tsconfig.app.json
|  |- tsconfig.spec.json
|  |- README.md
|  |- public/
|  `- src/
|     |- index.html
|     |- main.ts
|     |- styles.css
|     `- app/
|        |- app.config.ts
|        |- app.css
|        |- app.html
|        |- app.routes.ts
|        |- app.spec.ts
|        |- app.ts
|        |- core/
|        |  |- guards/
|        |  |- interceptors/
|        |  |- models/
|        |  `- services/
|        |- features/
|        |  |- auditoria/
|        |  |- auth/
|        |  |- categorias/
|        |  |- dashboard/
|        |  |- inventario/
|        |  |- movimientos/
|        |  |- productos/
|        |  |- proveedores/
|        |  `- usuarios/
|        |- layouts/
|        `- shared/
|           |- components/
|           |- constants/
|           |- directives/
|           |- services/
|           `- utils/
`- docs/
   |- ManualTecnico.md
   |- ManualUsuario.md
   |- Arquitectura.md
   |- Api.md
   |- EstructuraProyecto.md
   `- BuenasPracticas.md
```

## Descripcion por capa
- `backend/src/routes`: definicion de endpoints.
- `backend/src/controllers`: reglas por caso de uso.
- `backend/src/models`: acceso a datos.
- `frontend/src/app/features`: vistas y flujos por modulo.
- `frontend/src/app/shared`: componentes y utilidades reutilizables.
- `docs/`: documentacion funcional y tecnica para versionado.
