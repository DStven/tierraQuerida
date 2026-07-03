import { Injectable, inject } from '@angular/core';
import { Ciudad } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export type CiudadPayload = Omit<Ciudad, 'id_ciudad'>;

@Injectable({ providedIn: 'root' })
export class CiudadService extends ResourceService<Ciudad, CiudadPayload> {
  constructor() {
    super(inject(ApiService), '/ciudades');
  }
}
