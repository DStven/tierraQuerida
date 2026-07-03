import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, EmptyApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  get<T>(path: string, params?: Record<string, string | number | boolean | null>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        httpParams = httpParams.set(key, String(value));
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams })
      .pipe(map((response) => response.data));
  }

  post<T, B extends object>(path: string, body: B): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(map((response) => response.data));
  }

  put<T, B extends object>(path: string, body: B): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(map((response) => response.data));
  }

  delete(path: string): Observable<EmptyApiResponse> {
    return this.http.delete<EmptyApiResponse>(`${this.baseUrl}${path}`);
  }
}
