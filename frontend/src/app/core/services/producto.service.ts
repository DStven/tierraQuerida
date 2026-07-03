import { Injectable, inject } from '@angular/core';
import { Producto } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export type ProductoPayload = Omit<Producto, 'id_producto' | 'created_at' | 'updated_at'>;

@Injectable({ providedIn: 'root' })
export class ProductoService extends ResourceService<Producto, ProductoPayload> {
  constructor() {
    super(inject(ApiService), '/productos');
  }
}
