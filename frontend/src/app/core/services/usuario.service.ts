import { Injectable, inject } from '@angular/core';
import { UsuarioResponse, EstadoUsuario } from '../models/database.model';
import { ApiService } from './api.service';
import { ResourceService } from './resource.service';

export interface UsuarioCreatePayload {
  identificacion: string;
  nombre: string;
  email: string;
  clave: string;
  telefono: string | null;
  estado: EstadoUsuario;
  id_rol: number;
}

export type UsuarioUpdatePayload = Partial<UsuarioCreatePayload>;

@Injectable({ providedIn: 'root' })
export class UsuarioService extends ResourceService<UsuarioResponse, UsuarioCreatePayload, UsuarioUpdatePayload> {
  constructor() {
    super(inject(ApiService), '/usuarios');
  }
}
