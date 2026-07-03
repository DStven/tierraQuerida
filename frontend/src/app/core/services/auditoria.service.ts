import { Injectable, inject } from '@angular/core';
import { Auditoria } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

@Injectable({ providedIn: 'root' })
export class AuditoriaService extends ResourceService<Auditoria, Partial<Auditoria>> {
  constructor() {
    super(inject(ApiService), '/auditorias');
  }
}
