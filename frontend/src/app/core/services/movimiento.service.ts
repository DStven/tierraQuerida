import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MovimientoCreateData, MovimientoStock, TipoMovimiento } from '../models/database.model';
import { ApiService } from './api.service';

export interface MovimientoPayload {
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  fecha_movimiento?: string;
  observacion: string | null;
  id_usuario?: number;
  id_proveedor: number | null;
  id_inventario: number;
}

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly api = inject(ApiService);
  private readonly path = '/movimientos';

  list(): Observable<MovimientoStock[]> {
    return this.api.get<MovimientoStock[]>(this.path);
  }

  getById(id: number): Observable<MovimientoStock> {
    return this.api.get<MovimientoStock>(`${this.path}/${id}`);
  }

  create(payload: MovimientoPayload): Observable<MovimientoCreateData> {
    return this.api.post<MovimientoCreateData, MovimientoPayload>(this.path, payload);
  }
}
