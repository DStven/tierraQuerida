import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, of, switchMap, tap, timer, catchError, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { LoginData, UsuarioResponse } from '../models/database.model';
import { RolService } from './rol.service';

interface LoginPayload {
  email: string;
  clave: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly rolService = inject(RolService);
  private readonly tokenKey = 'tierra_querida_token';
  private readonly userKey = 'tierra_querida_user';
  private readonly roleKey = 'tierra_querida_role';
  private readonly tokenState = signal<string | null>(this.readToken());
  private readonly userState = signal<UsuarioResponse | null>(this.readUser());
  private readonly roleState = signal<string | null>(this.readRole());
  private refreshTimer?: Subscription;
  private readonly refreshIntervalMs = 30 * 60 * 1000; // 30 minutos

  readonly currentUser = this.userState.asReadonly();
  readonly currentRole = this.roleState.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.getValidToken()));
  readonly isAdmin = computed(() => this.roleState() === 'Administrador');
  readonly isEmpleado = computed(() => this.roleState() === 'Empleado');

  constructor() {
    const token = this.getValidToken();
    if (token) {
      this.validateSession();
    }
  }

  login(payload: LoginPayload): Observable<LoginData> {
    this.clearSession();

    return this.api.post<LoginData, LoginPayload>('/login', payload).pipe(
      tap((data) => {
        this.setToken(data.token);
      }),
      switchMap((data) =>
        this.rolService.list().pipe(
          tap((roles) => {
            const role = roles.find((rol) => Number(rol.id_rol) === Number(data.usuario.id_rol));
            const roleName = role?.nombre_rol ?? null;
            localStorage.setItem(this.userKey, JSON.stringify(data.usuario));
            if (roleName) {
              localStorage.setItem(this.roleKey, roleName);
            }
            this.userState.set(data.usuario);
            this.roleState.set(roleName);
            this.scheduleTokenRefresh();
          }),
          map(() => data),
        ),
      ),
    );
  }

  refreshToken(): Observable<string> {
    return this.api.get<{ token: string }>('/refresh').pipe(
      tap((data) => {
        this.setToken(data.token);
        this.scheduleTokenRefresh();
      }),
      map((data) => data.token),
    );
  }

  private validateSession(): void {
    this.perfil().subscribe({
      next: () => this.scheduleTokenRefresh(),
      error: () => this.clearSession(),
    });
  }

  private scheduleTokenRefresh(): void {
    this.cancelTokenRefresh();
    this.refreshTimer = timer(this.refreshIntervalMs, this.refreshIntervalMs)
      .pipe(
        switchMap(() =>
          this.refreshToken().pipe(
            catchError(() => {
              this.logout();
              return of(null);
            }),
          ),
        ),
      )
      .subscribe();
  }

  private cancelTokenRefresh(): void {
    this.refreshTimer?.unsubscribe();
    this.refreshTimer = undefined;
  }

  perfil(): Observable<UsuarioResponse> {
    return this.api.get<UsuarioResponse>('/perfil').pipe(
      switchMap((usuario) =>
        this.rolService.list().pipe(
          tap((roles) => {
            const role = roles.find((rol) => Number(rol.id_rol) === Number(usuario.id_rol));
            const roleName = role?.nombre_rol ?? null;
            localStorage.setItem(this.userKey, JSON.stringify(usuario));
            if (roleName) {
              localStorage.setItem(this.roleKey, roleName);
            }
            this.userState.set(usuario);
            this.roleState.set(roleName);
          }),
          map(() => usuario),
        ),
      ),
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.tokenState.set(token);
  }

  getToken(): string | null {
    return this.tokenState() ?? localStorage.getItem(this.tokenKey);
  }

  getValidToken(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return null;
    }

    return token;
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || typeof decoded.exp !== 'number') {
      return true;
    }

    return decoded.exp * 1000 < Date.now();
  }

  private decodeToken(token: string): { exp?: number } | null {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(decoded)));
    } catch {
      return null;
    }
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/login', { replaceUrl: true }).then(() => {
      window.location.reload();
    });
  }

  private clearSession(): void {
    this.cancelTokenRefresh();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.roleKey);
    this.tokenState.set(null);
    this.userState.set(null);
    this.roleState.set(null);
  }

  private readUser(): UsuarioResponse | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UsuarioResponse;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private readRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  private readToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
