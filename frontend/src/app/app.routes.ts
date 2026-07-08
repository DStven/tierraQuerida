import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () => import('./features/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./features/proveedores/proveedores.component').then((m) => m.ProveedoresComponent),
      },
      {
        path: 'categorias',
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () => import('./features/categorias/categorias.component').then((m) => m.CategoriasComponent),
      },
      {
        path: 'productos',
        canActivate: [roleGuard],
        data: { roles: ['Administrador', 'Empleado'] },
        loadComponent: () => import('./features/productos/productos.component').then((m) => m.ProductosComponent),
      },
      {
        path: 'auditoria',
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] },
        loadComponent: () => import('./features/auditoria/auditoria.component').then((m) => m.AuditoriaComponent),
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/inventario/inventario.component').then((m) => m.InventarioComponent),
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./features/movimientos/movimientos.component').then((m) => m.MovimientosComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
