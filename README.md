# Tierra Querida - Sistema de Gestion de Inventario

Aplicacion web full stack para la gestion de inventario, movimientos de stock, proveedores, usuarios y auditoria en una operacion tipo hamburgueseria.

## Descripcion
Tierra Querida centraliza el control operativo de materia prima y usuarios en un solo panel, con autenticacion JWT y permisos por rol. Incluye:

- Gestion de usuarios y roles
- Gestion de proveedores, categorias y productos
- Inventario con niveles de stock y alertas
- Movimientos de entrada/salida con trazabilidad
- Auditoria de acciones del sistema
- Dashboard con metricas y visualizaciones

## Tecnologias Utilizadas
### Backend
- Node.js
- Express 5
- MySQL 8 (mysql2)
- JWT (jsonwebtoken)
- bcrypt

### Frontend
- Angular 21 (Standalone Components)
- TypeScript
- Tailwind CSS 4
- Chart.js
- Lucide Icons
- RxJS

## Arquitectura
- Arquitectura en capas simple y desacoplada:
  - Presentacion: Angular (features + shared components)
  - API: Express (routes + controllers + middleware)
  - Acceso a datos: modelos Node.js sobre MySQL
- Autenticacion basada en JWT con middleware de autorizacion por rol.
- Estructura modular por dominio (usuarios, productos, inventario, movimientos, auditoria, etc.).

Mas detalle en [docs/Arquitectura.md](docs/Arquitectura.md).

## Capturas
> Reemplazar estos marcadores por imagenes reales en la carpeta docs/capturas/.

- Dashboard principal  
  ![Dashboard](docs/capturas/dashboard-placeholder.png)
- Inventario  
  ![Inventario](docs/capturas/inventario-placeholder.png)
- Movimientos  
  ![Movimientos](docs/capturas/movimientos-placeholder.png)
- Proveedores  
  ![Proveedores](docs/capturas/proveedores-placeholder.png)

## Instalacion
### Requisitos
- Node.js 20+
- npm 10+
- MySQL 8+

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Variables de Entorno
Crear archivo `.env` en `backend/` con los siguientes valores:

```env
PORT=3000
CORS_ORIGIN=http://localhost:4200

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tierraQuerida_db
DB_CONNECTION_LIMIT=10

JWT_SECRET=tu_clave_super_segura
JWT_EXPIRES_IN=1h
```

## Ejecucion
### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm start
```

### Build de Frontend
```bash
cd frontend
npm run build
```

## Roles del Sistema
- Administrador:
  - Acceso completo a todos los modulos
  - CRUD de usuarios, productos, inventario, proveedores y catalogos
  - Visualizacion de auditoria y listado completo de movimientos
- Empleado:
  - Consulta de modulos operativos permitidos
  - Registro de movimientos de inventario
  - Sin permisos de administracion global

## Funcionalidades Principales
- Login y perfil de usuario
- Dashboard con KPIs y graficas
- Gestion de usuarios y roles
- Gestion de proveedores
- Gestion de categorias y productos
- Gestion de inventario
- Registro de movimientos de stock
- Auditoria de eventos

## Estructura del Proyecto
```text
tierraQueridaProject/
|- backend/
|  |- src/
|  |  |- config/
|  |  |- controllers/
|  |  |- middleware/
|  |  |- models/
|  |  |- routes/
|  |  `- utils/
|- frontend/
|  |- src/
|  |  |- app/
|  |  |  |- core/
|  |  |  |- features/
|  |  |  |- layouts/
|  |  |  `- shared/
|  |  `- styles.css
|- docs/
|- database_schema.md
|- CHANGELOG.md
`- LICENSE
```

Detalle completo en [docs/EstructuraProyecto.md](docs/EstructuraProyecto.md).

## Documentacion Tecnica
- [docs/ManualTecnico.md](docs/ManualTecnico.md)
- [docs/ManualUsuario.md](docs/ManualUsuario.md)
- [docs/Arquitectura.md](docs/Arquitectura.md)
- [docs/Api.md](docs/Api.md)
- [docs/EstructuraProyecto.md](docs/EstructuraProyecto.md)
- [docs/BuenasPracticas.md](docs/BuenasPracticas.md)

## Autor
Steven M
