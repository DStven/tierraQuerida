# Buenas Practicas - Tierra Querida

## 1. Backend
- Mantener validaciones de entrada en controladores.
- Centralizar respuestas usando `apiResponse`.
- Usar `asyncHandler` para manejo consistente de errores async.
- Evitar logica de negocio en rutas.
- Respetar middlewares de autenticacion y autorizacion por rol.

## 2. Frontend
- Mantener componentes standalone por dominio.
- Reutilizar componentes de `shared` antes de crear nuevos.
- Mantener consistencia visual con clases globales (`btn-*`, `form-input`, `card`, `table-modern`).
- Evitar logica compleja en templates.
- Gestionar estado local con Signals cuando aplique.

## 3. Seguridad
- No exponer secretos en repositorio.
- Usar variables de entorno para credenciales y JWT.
- Validar autorizacion por rol en backend (no confiar solo en frontend).
- Sanitizar respuestas para no exponer campos sensibles (ej. `clave`).

## 4. Base de datos
- Usar llaves foraneas para consistencia referencial.
- Aplicar transacciones en operaciones sensibles de inventario.
- Evitar cambios de esquema sin versionado/documentacion.

## 5. Git y versionado
- Usar Commits atomicos por alcance.
- Mantener actualizado `CHANGELOG.md` con SemVer.
- Proteger rama principal con revisiones.
- No versionar artefactos temporales o de build.

## 6. Calidad y pruebas
- Ejecutar build antes de merge:
  - `frontend: npm run build`
- Verificar endpoints criticos en entorno local.
- Revisar errores de consola y networking en UI.

## 7. Documentacion
- Mantener README y docs sincronizados con rutas reales.
- Documentar cualquier cambio de permisos, endpoints o variables de entorno.
- Incluir capturas actualizadas para presentacion de portafolio.
