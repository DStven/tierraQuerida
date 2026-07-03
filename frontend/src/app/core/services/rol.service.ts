import { Injectable, inject } from '@angular/core';
import { Rol } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export type RolPayload = Omit<Rol, 'id_rol'>;

@Injectable({ providedIn: 'root' })
export class RolService extends ResourceService<Rol, RolPayload> {
  constructor() {
    super(inject(ApiService), '/roles');
  }
}
