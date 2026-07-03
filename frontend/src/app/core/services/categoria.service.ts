import { Injectable, inject } from '@angular/core';
import { Categoria } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export type CategoriaPayload = Omit<Categoria, 'id_categoria'>;

@Injectable({ providedIn: 'root' })
export class CategoriaService extends ResourceService<Categoria, CategoriaPayload> {
  constructor() {
    super(inject(ApiService), '/categorias');
  }
}
