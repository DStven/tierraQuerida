const BaseModel = require('./baseModel');

module.exports = {
  rol: new BaseModel('rol', 'id_rol'),
  usuario: new BaseModel('usuario', 'id_usuario'),
  departamento: new BaseModel('departamento', 'id_dpto'),
  ciudad: new BaseModel('ciudad', 'id_ciudad'),
  proveedor: new BaseModel('proveedor', 'id_proveedor'),
  categoria: new BaseModel('categoria', 'id_categoria'),
  inventario: new BaseModel('inventario', 'id_inventario'),
  movimiento_stock: new BaseModel('movimiento_stock', 'id_movimiento'),
  producto: new BaseModel('producto', 'id_producto'),
  auditoria: new BaseModel('auditoria', 'id_auditoria'),
  proveedor_producto: new BaseModel('proveedor_producto', 'id_proveedor'),
};
