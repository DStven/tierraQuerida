import { Injectable, inject } from '@angular/core';
import { Proveedor } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export type ProveedorPayload = Omit<Proveedor, 'id_proveedor'>;

@Injectable({ providedIn: 'root' })
export class ProveedorService extends ResourceService<Proveedor, ProveedorPayload> {
  constructor() {
    super(inject(ApiService), '/proveedores');
  }
}
