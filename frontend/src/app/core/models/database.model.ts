export type EstadoUsuario = 'Activo' | 'Inactivo' | number | boolean | string;
export type EstadoInventario = 'Disponible' | 'Agotado' | number | boolean | string;
export type TipoMovimiento = 'Entrada' | 'Salida';

export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
}

export interface Usuario {
  id_usuario: number;
  identificacion: string;
  nombre: string;
  email: string;
  clave: string;
  telefono: string | null;
  estado: EstadoUsuario;
  fecha_creacion: string;
  id_rol: number;
}

/** Campos devueltos por GET /usuarios, GET /usuarios/:id, POST /login y GET /perfil */
export type UsuarioResponse = Pick<
  Usuario,
  'id_usuario' | 'identificacion' | 'nombre' | 'email' | 'telefono' | 'estado' | 'id_rol'
>;

export interface Departamento {
  id_dpto: number;
  nombre: string;
}

export interface Ciudad {
  id_ciudad: number;
  nombre: string;
  id_dpto: number;
}

export interface Proveedor {
  id_proveedor: number;
  nit: string;
  razon_social: string;
  direccion: string | null;
  email: string | null;
  telefono: string | null;
  id_ciudad: number;
  fecha_registro?: string | null;
  estado?: 'Activo' | 'Inactivo' | string;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio_unitario: string | number | null;
  id_categoria: number;
  created_at?: string;
  updated_at?: string;
}

export interface Auditoria {
  id_auditoria: number;
  accion: string;
  descripcion: string | null;
  fecha: string;
  id_usuario: number | null;
}

export interface Inventario {
  id_inventario: number;
  producto: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string | null;
  precio_unitario: string | number | null;
  estado: EstadoInventario;
  fecha_registro: string;
  id_categoria: number;
  id_producto?: number;
  nombre_categoria?: string;
}

export interface MovimientoStock {
  id_movimiento: number;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  fecha_movimiento: string;
  observacion: string | null;
  id_usuario: number;
  id_proveedor: number | null;
  id_inventario: number;
}

export interface LoginData {
  usuario: UsuarioResponse;
  token: string;
}

export interface MovimientoCreateData {
  movimiento: MovimientoStock;
  stock_anterior: number;
  stock_actual: number;
}
