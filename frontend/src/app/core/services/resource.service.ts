import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export abstract class ResourceService<T extends object, C extends object, U extends object = Partial<C>> {
  protected constructor(
    protected readonly api: ApiService,
    private readonly path: string,
  ) {}

  list(params?: Record<string, string | number | boolean | null>): Observable<T[]> {
    return this.api.get<T[]>(this.path, params);
  }

  getById(id: number): Observable<T> {
    return this.api.get<T>(`${this.path}/${id}`);
  }

  create(payload: C): Observable<T> {
    return this.api.post<T, C>(this.path, payload);
  }

  update(id: number, payload: U): Observable<T> {
    return this.api.put<T, U>(`${this.path}/${id}`, payload);
  }

  remove(id: number) {
    return this.api.delete(`${this.path}/${id}`);
  }
}
