import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Rol, UsuarioResponse, EstadoUsuario } from '../../core/models/database.model';
import { RolService } from '../../core/services/rol.service';
import { UsuarioCreatePayload, UsuarioService, UsuarioUpdatePayload } from '../../core/services/usuario.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { filterBySearch } from '../../shared/utils/filter.util';
import { debounce } from '../../shared/utils/debounce.util';
import { isFieldInvalid } from '../../shared/utils/form.util';
import { buildPagination, paginate } from '../../shared/utils/pagination.util';
import { SortDirection, sortItems, toggleSort } from '../../shared/utils/sort.util';
import { getInitials } from '../../shared/utils/string.util';

type SortField = 'identificacion' | 'nombre' | 'email' | 'estado' | 'id_rol';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaginationComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    SkeletonTableComponent,
    SpinnerComponent,
  ],
  template: `
    <section class="mx-auto max-w-7xl space-y-5">
      <app-page-header
        title="Usuarios"
        subtitle="Gestión de cuentas del sistema"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="usuarios().length"
        [filteredCount]="filtered().length"
      >
        <button actions type="button" (click)="openCreate()" class="btn-primary">Nuevo usuario</button>
      </app-page-header>

      <div class="card overflow-hidden">
        <div class="card-header">
          <div class="max-w-md w-full relative">
            <input type="search" [value]="search()" (input)="onSearch($event)" placeholder="Buscar por nombre, email o identificación..." class="form-input w-full pl-10" />
            <svg class="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        @if (loading()) {
          <app-skeleton-table [rows]="6" [cols]="7" />
        } @else if (!filtered().length) {
          <app-empty-state
            [type]="search() ? 'search' : 'users'"
            [title]="search() ? 'Sin resultados' : 'No hay usuarios registrados'"
            [description]="search() ? 'No se encontraron usuarios con ese criterio.' : 'Cree el primer usuario para comenzar a gestionar el acceso al sistema.'"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="table-modern w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="px-4 py-3 font-medium">Usuario</th>
                  <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('identificacion')">Identificación {{ sortIcon('identificacion') }}</th>
                  <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('email')">Email {{ sortIcon('email') }}</th>
                  <th class="px-4 py-3 font-medium">Teléfono</th>
                  <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('estado')">Estado {{ sortIcon('estado') }}</th>
                  <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('id_rol')">Rol {{ sortIcon('id_rol') }}</th>
                  <th class="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (usuario of pageItems(); track usuario.id_usuario) {
                  <tr>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="avatar avatar-sm avatar-amber">{{ getInitials(usuario.nombre) }}</div>
                        <span class="font-medium text-zinc-100">{{ usuario.nombre }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-zinc-400">{{ usuario.identificacion }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ usuario.email }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ usuario.telefono || '—' }}</td>
                    <td class="px-4 py-3">
                      <span class="badge" [class.badge-success]="isActive(usuario.estado)" [class.badge-danger]="!isActive(usuario.estado)">
                        {{ formatEstado(usuario.estado) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-zinc-300">{{ roleName(usuario.id_rol) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button type="button" (click)="openEdit(usuario)" class="btn-ghost">Editar</button>
                        <button type="button" (click)="remove(usuario)" class="btn-danger">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (!loading() && filtered().length) {
          <div class="border-t border-white/[0.06] p-4">
            <app-pagination [state]="pagination()" (pageChange)="setPage($event)" />
          </div>
        }
      </div>

      @if (modalOpen()) {
        <div class="modal-overlay" (click)="closeModal()">
          <form [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()" class="modal-content max-w-lg">
            <h3 class="text-lg font-semibold text-white">{{ editingId() ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
            @if (formError()) {
              <p class="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{{ formError() }}</p>
            }
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <label class="form-label sm:col-span-2">
                Identificación<span class="required-mark">*</span>
                <input formControlName="identificacion" class="form-input mt-1.5" [class.is-invalid]="invalid('identificacion')" />
                @if (invalid('identificacion')) { <span class="form-error">Campo obligatorio</span> }
              </label>
              <label class="form-label sm:col-span-2">
                Nombre<span class="required-mark">*</span>
                <input formControlName="nombre" class="form-input mt-1.5" [class.is-invalid]="invalid('nombre')" />
                @if (invalid('nombre')) { <span class="form-error">Campo obligatorio</span> }
              </label>
              <label class="form-label sm:col-span-2">
                Email<span class="required-mark">*</span>
                <input type="email" formControlName="email" class="form-input mt-1.5" [class.is-invalid]="invalid('email')" />
                @if (invalid('email')) { <span class="form-error">Ingrese un email válido</span> }
              </label>
              <label class="form-label sm:col-span-2">
                Clave @if (!editingId()) { <span class="required-mark">*</span> } @else { <span class="text-zinc-500">(opcional)</span> }
                <input type="password" formControlName="clave" class="form-input mt-1.5" [class.is-invalid]="invalid('clave')" />
                @if (invalid('clave')) {
                  <span class="form-error">
                    @if (form.controls.clave.errors?.['required']) {
                      La clave es obligatoria
                    } @else if (form.controls.clave.errors?.['minlength']) {
                      La clave debe tener mínimo 8 caracteres
                    } @else {
                      La clave no es válida
                    }
                  </span>
                }
              </label>
              <label class="form-label">
                Teléfono
                <input formControlName="telefono" class="form-input mt-1.5" />
              </label>
              <label class="form-label">
                Estado<span class="required-mark">*</span>
                <select formControlName="estado" class="form-input mt-1.5">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>
              <label class="form-label sm:col-span-2">
                Rol<span class="required-mark">*</span>
                <select formControlName="id_rol" class="form-input mt-1.5" [class.is-invalid]="invalid('id_rol')">
                  @for (rol of roles(); track rol.id_rol) {
                    <option [value]="rol.id_rol">{{ rol.nombre_rol }}</option>
                  }
                </select>
              </label>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <button type="button" (click)="closeModal()" class="btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="btn-primary">
                @if (saving()) { <app-spinner size="sm" /> Guardando... } @else { Guardar }
              </button>
            </div>
          </form>
        </div>
      }
    </section>
  `,
})
export class UsuariosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly getInitials = getInitials;
  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Usuarios' }];
  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly sortField = signal<SortField>('nombre');
  readonly sortDirection = signal<SortDirection>('asc');

  readonly filtered = computed(() => {
    const base = this.usuarios().map((usuario) => ({
      ...usuario,
      estado_label: this.formatEstado(usuario.estado),
      rol_label: this.roleName(usuario.id_rol),
    }));

    let items = filterBySearch(base, this.search(), ['identificacion', 'nombre', 'email', 'estado_label', 'rol_label']);
    items = sortItems(items, this.sortField(), this.sortDirection());
    return items;
  });
  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    identificacion: ['', Validators.required],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.minLength(8)]],
    telefono: [''],
    estado: ['Activo' as EstadoUsuario, Validators.required],
    id_rol: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.loadData();
  }

  invalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({ usuarios: this.usuarioService.list(), roles: this.rolService.list() }).subscribe({
      next: ({ usuarios, roles }) => {
        this.usuarios.set(usuarios);
        this.roles.set(roles);
        if (roles.length && !this.editingId()) {
          this.form.patchValue({ id_rol: roles[0].id_rol });
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar los usuarios');
      },
    });
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  setSort(field: SortField): void {
    const next = toggleSort(this.sortField(), this.sortDirection(), field);
    this.sortField.set(next.field as SortField);
    this.sortDirection.set(next.direction);
    this.page.set(1);
  }

  sortIcon(field: SortField): string {
    if (this.sortField() !== field) {
      return '↕';
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ identificacion: '', nombre: '', email: '', clave: '', telefono: '', estado: 'Activo', id_rol: this.roles()[0]?.id_rol ?? 0 });
    this.form.controls.clave.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.clave.updateValueAndValidity();
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(usuario: UsuarioResponse): void {
    this.editingId.set(usuario.id_usuario);
    this.form.reset({
      identificacion: usuario.identificacion,
      nombre: usuario.nombre,
      email: usuario.email,
      clave: '',
      telefono: usuario.telefono ?? '',
      estado: this.isActive(usuario.estado) ? 'Activo' : 'Inactivo',
      id_rol: usuario.id_rol,
    });
    this.form.controls.clave.clearValidators();
    this.form.controls.clave.updateValueAndValidity();
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: UsuarioUpdatePayload = {
      identificacion: raw.identificacion,
      nombre: raw.nombre,
      email: raw.email,
      telefono: raw.telefono || null,
      estado: raw.estado,
      id_rol: Number(raw.id_rol),
    };
    if (raw.clave) payload.clave = raw.clave;

    this.saving.set(true);
    this.formError.set(null);

    const id = this.editingId();
    const createPayload: UsuarioCreatePayload = {
      identificacion: raw.identificacion,
      nombre: raw.nombre,
      email: raw.email,
      clave: raw.clave,
      telefono: raw.telefono || null,
      estado: raw.estado,
      id_rol: Number(raw.id_rol),
    };
    const request = id ? this.usuarioService.update(id, payload) : this.usuarioService.create(createPayload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
        this.toast.success(id ? 'Usuario actualizado' : 'Usuario creado');
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err.error?.message ?? 'No fue posible guardar el usuario';
        this.formError.set(msg);
        this.toast.error(msg);
        this.saving.set(false);
      },
    });
  }

  remove(usuario: UsuarioResponse): void {
    void this.confirm
      .confirm({
        title: 'Eliminar usuario',
        message: `¿Está seguro de eliminar a "${usuario.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        type: 'danger',
      })
      .then((ok) => {
        if (!ok) return;
        this.usuarioService.remove(usuario.id_usuario).subscribe({
          next: () => {
            this.loadData();
            this.toast.success('Usuario eliminado');
          },
          error: (err: { error?: { message?: string } }) =>
            this.toast.error(err.error?.message ?? 'No fue posible eliminar'),
        });
      });
  }

  roleName(idRol: number): string {
    return this.roles().find((rol) => Number(rol.id_rol) === Number(idRol))?.nombre_rol ?? `Rol ${idRol}`;
  }

  isActive(estado: UsuarioResponse['estado']): boolean {
    return estado === 'Activo' || estado === 1 || estado === true || String(estado).toLowerCase() === 'activo';
  }

  formatEstado(estado: UsuarioResponse['estado']): string {
    return this.isActive(estado) ? 'Activo' : 'Inactivo';
  }
}
