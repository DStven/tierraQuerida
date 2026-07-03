export const APP_ICONS = {
  dashboard: 'layout-dashboard',
  usuarios: 'users',
  proveedores: 'truck',
  categorias: 'tags',
  productos: 'package',
  inventario: 'boxes',
  movimientos: 'arrow-left-right',
  alertas: 'triangle-alert',
  auditoria: 'clipboard-list',
} as const;

export type AppIconName = (typeof APP_ICONS)[keyof typeof APP_ICONS];
