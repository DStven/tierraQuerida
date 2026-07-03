import { Injectable, inject } from '@angular/core';
import { Departamento } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export type DepartamentoPayload = Omit<Departamento, 'id_dpto'>;

@Injectable({ providedIn: 'root' })
export class DepartamentoService extends ResourceService<Departamento, DepartamentoPayload> {
  constructor() {
    super(inject(ApiService), '/departamentos');
  }
}
