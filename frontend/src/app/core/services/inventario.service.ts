import { Injectable, inject } from '@angular/core';
import { EstadoInventario, Inventario } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export interface InventarioPayload {
  producto: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string | null;
  precio_unitario: number | string | null;
  estado: EstadoInventario;
  fecha_registro?: string;
  id_categoria: number;
}

@Injectable({ providedIn: 'root' })
export class InventarioService extends ResourceService<Inventario, InventarioPayload> {
  constructor() {
    super(inject(ApiService), '/inventario');
  }
}
