import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Ciudad, Departamento, Proveedor } from '../../core/models/database.model';
import { AuthService } from '../../core/services/auth.service';
import { CiudadService } from '../../core/services/ciudad.service';
import { DepartamentoService } from '../../core/services/departamento.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { debounce } from '../../shared/utils/debounce.util';
import { buildPagination, paginate } from '../../shared/utils/pagination.util';
import { SortDirection, sortItems, toggleSort } from '../../shared/utils/sort.util';
import { formatDateEs, getInitials } from '../../shared/utils/string.util';

type SortField = 'nit' | 'email' | 'id_ciudad';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PaginationComponent, PageHeaderComponent, EmptyStateComponent, SkeletonTableComponent, SpinnerComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-5">
      <app-page-header
        title="Proveedores"
        subtitle="Administra los proveedores de materia prima"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="proveedores().length"
        [filteredCount]="filtered().length"
      >
        @if (auth.isAdmin()) {
          <button actions type="button" (click)="openCreate()" class="btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
            Nuevo proveedor
          </button>
        }
      </app-page-header>

      <div class="card overflow-hidden">
        <div class="card-header">
          <div class="flex-1 min-w-[200px] max-w-md relative">
            <input
              type="search"
              [value]="search()"
              (input)="onSearch($event)"
              placeholder="Buscar por nombre, ciudad o departamento..."
              class="form-input w-full pl-10"
            />
            <svg class="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select
              [value]="cityFilter()"
              (change)="onCityFilter($event)"
              class="form-input w-auto min-w-[140px] py-2 text-sm"
            >
              <option value="">Todas las ciudades</option>
              @for (ciudad of ciudades(); track ciudad.id_ciudad) {
                <option [value]="ciudad.id_ciudad">{{ ciudad.nombre }}</option>
              }
            </select>
            <select
              [value]="deptFilter()"
              (change)="onDeptFilter($event)"
              class="form-input w-auto min-w-[160px] py-2 text-sm"
            >
              <option value="">Todos los departamentos</option>
              @for (depto of departamentos(); track depto.id_dpto) {
                <option [value]="depto.id_dpto">{{ depto.nombre }}</option>
              }
            </select>
          </div>
        </div>

        @if (loading()) {
          <app-skeleton-table [rows]="6" [cols]="7" />
        } @else if (!filtered().length) {
          <app-empty-state
            [type]="hasFilters() ? 'search' : 'suppliers'"
            [title]="hasFilters() ? 'Sin resultados' : 'No hay proveedores registrados'"
            [description]="hasFilters() ? 'No se encontraron proveedores con los filtros aplicados.' : 'Registre proveedores para gestionar las entradas de materia prima.'"
          />
        } @else {
        <div class="overflow-x-auto">
          <table class="table-modern w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="px-4 py-3 font-medium">Proveedor</th>
                <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('nit')">
                  NIT {{ sortIcon('nit') }}
                </th>
                <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('email')">
                  Contacto {{ sortIcon('email') }}
                </th>
                <th class="table-sortable px-4 py-3 font-medium" (click)="setSort('id_ciudad')">
                  Ciudad {{ sortIcon('id_ciudad') }}
                </th>
                <th class="px-4 py-3 font-medium">Estado</th>
                <th class="px-4 py-3 font-medium">Registro</th>
                <th class="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (proveedor of pageItems(); track proveedor.id_proveedor) {
                <tr>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="avatar avatar-sm avatar-amber">{{ getInitials(proveedor.razon_social) }}</div>
                      <div>
                        <p class="font-semibold text-zinc-100">{{ proveedor.razon_social }}</p>
                        <p class="text-xs text-zinc-500">{{ proveedor.direccion || 'Sin dirección' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-zinc-300">{{ proveedor.nit }}</td>
                  <td class="px-4 py-3">
                    <div class="space-y-1">
                      @if (proveedor.email) {
                        <p class="flex items-center gap-1.5 text-xs text-zinc-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 shrink-0 text-amber-500/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          {{ proveedor.email }}
                        </p>
                      }
                      @if (proveedor.telefono) {
                        <p class="flex items-center gap-1.5 text-xs text-zinc-400">
                          <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5 shrink-0 text-amber-500/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          {{ proveedor.telefono }}
                        </p>
                      }
                      @if (!proveedor.email && !proveedor.telefono) {
                        <span class="text-xs text-zinc-500">—</span>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-3 text-zinc-300">{{ cityName(proveedor.id_ciudad) }}</td>
                  <td class="px-4 py-3">
                    <span class="badge badge-success">Activo</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-zinc-400">{{ formatDateEs(proveedor.fecha_registro) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1.5">
                      <button type="button" (click)="openDetail(proveedor)" class="btn-ghost" title="Ver detalle">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        Ver
                      </button>
                      @if (auth.isAdmin()) {
                        <button type="button" (click)="openEdit(proveedor)" class="btn-ghost" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          Editar
                        </button>
                        <button type="button" (click)="remove(proveedor)" class="btn-danger" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          Eliminar
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-16 text-center">
                    <p class="text-sm text-zinc-500">No hay proveedores en esta página</p>
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

      <!-- Create/Edit Modal -->
      @if (modalOpen()) {
        <div class="modal-overlay" (click)="closeModal()">
          <form
            [formGroup]="form"
            (ngSubmit)="save()"
            (click)="$event.stopPropagation()"
            class="modal-content max-w-xl"
          >
            <div class="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 class="text-lg font-semibold text-white">
                  {{ editingId() ? 'Editar proveedor' : 'Nuevo proveedor' }}
                </h3>
                <p class="mt-1 text-sm text-zinc-500">Complete la información del proveedor</p>
              </div>
              <button type="button" (click)="closeModal()" class="rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            @if (formError()) {
              <p class="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{{ formError() }}</p>
            }

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="form-label">
                NIT <span class="text-red-400">*</span>
                <input formControlName="nit" class="form-input mt-1.5" [class.is-invalid]="isInvalid('nit')" />
                @if (isInvalid('nit')) { <span class="form-error">El NIT es obligatorio</span> }
              </label>
              <label class="form-label">
                Razón Social <span class="text-red-400">*</span>
                <input formControlName="razon_social" class="form-input mt-1.5" [class.is-invalid]="isInvalid('razon_social')" />
                @if (isInvalid('razon_social')) { <span class="form-error">La razón social es obligatoria</span> }
              </label>
              <label class="form-label">
                Correo electrónico
                <input type="email" formControlName="email" class="form-input mt-1.5" [class.is-invalid]="isInvalid('email')" />
                @if (isInvalid('email')) { <span class="form-error">Ingrese un email válido</span> }
              </label>
              <label class="form-label">
                Teléfono
                <input formControlName="telefono" class="form-input mt-1.5" [class.is-invalid]="isInvalid('telefono')" />
                @if (isInvalid('telefono')) { <span class="form-error">Ingrese un teléfono válido</span> }
              </label>
              <label class="form-label sm:col-span-2">
                Dirección
                <input formControlName="direccion" class="form-input mt-1.5" />
              </label>
              <label class="form-label">
                Departamento <span class="text-red-400">*</span>
                <select
                  [value]="selectedDepto()"
                  (change)="onDeptoChange($event)"
                  class="form-input mt-1.5"
                >
                  <option value="" disabled>Seleccione departamento</option>
                  @for (depto of departamentos(); track depto.id_dpto) {
                    <option [value]="depto.id_dpto">{{ depto.nombre }}</option>
                  }
                </select>
              </label>
              <label class="form-label">
                Ciudad <span class="text-red-400">*</span>
                <select formControlName="id_ciudad" class="form-input mt-1.5" [class.is-invalid]="isInvalid('id_ciudad')">
                  <option value="" disabled>Seleccione ciudad</option>
                  @for (ciudad of filteredCiudades(); track ciudad.id_ciudad) {
                    <option [value]="ciudad.id_ciudad">{{ ciudad.nombre }}</option>
                  }
                </select>
                @if (isInvalid('id_ciudad')) { <span class="form-error">Seleccione una ciudad</span> }
              </label>
            </div>

            <div class="mt-6 flex justify-end gap-2 border-t border-white/[0.06] pt-4">
              <button type="button" (click)="closeModal()" class="btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="form.invalid || saving()" class="btn-primary">
                @if (saving()) { <app-spinner size="sm" /> Guardando... } @else { Guardar }
              </button>
            </div>
          </form>
        </div>
      }

      <!-- Detail Modal -->
      @if (detailProveedor(); as p) {
        <div class="modal-overlay" (click)="closeDetail()">
          <div class="modal-content max-w-lg" (click)="$event.stopPropagation()">
            <div class="mb-5 flex items-start gap-4">
              <div class="avatar avatar-md avatar-amber">{{ getInitials(p.razon_social) }}</div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-white">{{ p.razon_social }}</h3>
                <p class="text-sm text-zinc-500">NIT: {{ p.nit }}</p>
                <span class="badge badge-success mt-2">Activo</span>
              </div>
              <button type="button" (click)="closeDetail()" class="rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <dl class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <dt class="text-xs text-zinc-500">Correo electrónico</dt>
                <dd class="mt-1 text-sm text-zinc-200">{{ p.email || '—' }}</dd>
              </div>
              <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <dt class="text-xs text-zinc-500">Teléfono</dt>
                <dd class="mt-1 text-sm text-zinc-200">{{ p.telefono || '—' }}</dd>
              </div>
              <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 sm:col-span-2">
                <dt class="text-xs text-zinc-500">Dirección</dt>
                <dd class="mt-1 text-sm text-zinc-200">{{ p.direccion || '—' }}</dd>
              </div>
              <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <dt class="text-xs text-zinc-500">Ciudad</dt>
                <dd class="mt-1 text-sm text-zinc-200">{{ cityName(p.id_ciudad) }}</dd>
              </div>
              <div class="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                <dt class="text-xs text-zinc-500">Departamento</dt>
                <dd class="mt-1 text-sm text-zinc-200">{{ deptNameByCity(p.id_ciudad) }}</dd>
              </div>
            </dl>

            <div class="mt-6 flex justify-end gap-2">
              @if (auth.isAdmin()) {
                <button type="button" (click)="openEditFromDetail(p)" class="btn-primary">Editar</button>
              }
              <button type="button" (click)="closeDetail()" class="btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class ProveedoresComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly proveedorService = inject(ProveedorService);
  private readonly ciudadService = inject(CiudadService);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Proveedores' }];
  readonly getInitials = getInitials;
  readonly formatDateEs = formatDateEs;

  readonly proveedores = signal<Proveedor[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly departamentos = signal<Departamento[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly cityFilter = signal('');
  readonly deptFilter = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly detailProveedor = signal<Proveedor | null>(null);
  readonly selectedDepto = signal<number | ''>('');
  readonly sortField = signal<SortField | null>(null);
  readonly sortDirection = signal<SortDirection>('asc');

  readonly filteredCiudades = computed(() => {
    const deptoId = this.selectedDepto();
    if (!deptoId) {
      return this.ciudades();
    }
    return this.ciudades().filter((c) => Number(c.id_dpto) === Number(deptoId));
  });

  readonly filtered = computed(() => {
    const citiesById = new Map(
      this.ciudades().map((ciudad) => [Number(ciudad.id_ciudad), ciudad]),
    );

    const term = this.search().trim().toLowerCase();
    let items = this.proveedores();

    if (term) {
      items = items.filter((proveedor) => {
        const city = citiesById.get(Number(proveedor.id_ciudad));
        const dept = city
          ? this.departamentos().find((d) => Number(d.id_dpto) === Number(city.id_dpto))
          : null;

        return (
          String(proveedor.nit ?? '').toLowerCase().includes(term)
          || String(proveedor.razon_social ?? '').toLowerCase().includes(term)
          || String(proveedor.email ?? '').toLowerCase().includes(term)
          || String(proveedor.telefono ?? '').toLowerCase().includes(term)
          || String(city?.nombre ?? '').toLowerCase().includes(term)
          || String(dept?.nombre ?? '').toLowerCase().includes(term)
        );
      });
    }

    const cityId = this.cityFilter();
    if (cityId) {
      items = items.filter((p) => Number(p.id_ciudad) === Number(cityId));
    }

    const deptId = this.deptFilter();
    if (deptId) {
      const cityIds = this.ciudades()
        .filter((c) => Number(c.id_dpto) === Number(deptId))
        .map((c) => Number(c.id_ciudad));
      items = items.filter((p) => cityIds.includes(Number(p.id_ciudad)));
    }

    const field = this.sortField();
    if (field) {
      items = sortItems(items, field, this.sortDirection());
    }

    return items;
  });

  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    nit: ['', Validators.required],
    razon_social: ['', Validators.required],
    direccion: [''],
    email: ['', Validators.email],
    telefono: ['', Validators.pattern(/^\+?[0-9\s()\-]{7,20}$/)],
    id_ciudad: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      proveedores: this.proveedorService.list(),
      ciudades: this.ciudadService.list(),
      departamentos: this.departamentoService.list(),
    }).subscribe({
      next: ({ proveedores, ciudades, departamentos }) => {
        this.proveedores.set(this.sortByNewestRegistro(proveedores));
        this.ciudades.set(ciudades);
        this.departamentos.set(departamentos);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar los proveedores');
      },
    });
  }

  hasFilters(): boolean {
    return Boolean(this.search() || this.cityFilter() || this.deptFilter());
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  onCityFilter(event: Event): void {
    this.cityFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  onDeptFilter(event: Event): void {
    this.deptFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  setSort(field: SortField): void {
    const result = toggleSort(this.sortField(), this.sortDirection(), field);
    this.sortField.set(result.field as SortField);
    this.sortDirection.set(result.direction);
  }

  sortIcon(field: SortField): string {
    if (this.sortField() !== field) {
      return '↕';
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  cityName(id: number): string {
    return this.ciudades().find((c) => Number(c.id_ciudad) === Number(id))?.nombre ?? `Ciudad ${id}`;
  }

  deptNameByCity(cityId: number): string {
    const city = this.ciudades().find((c) => Number(c.id_ciudad) === Number(cityId));
    if (!city) {
      return '—';
    }
    return this.departamentos().find((d) => Number(d.id_dpto) === Number(city.id_dpto))?.nombre ?? '—';
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return Boolean(control?.invalid && control.touched);
  }

  onDeptoChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.selectedDepto.set(value);
    const cities = this.filteredCiudades();
    if (cities.length) {
      this.form.patchValue({ id_ciudad: cities[0].id_ciudad });
    } else {
      this.form.patchValue({ id_ciudad: 0 });
    }
  }

  openCreate(): void {
    this.editingId.set(null);
    const firstDepto = this.departamentos()[0];
    const deptoId = firstDepto?.id_dpto ?? '';
    this.selectedDepto.set(deptoId);
    const cities = deptoId
      ? this.ciudades().filter((c) => Number(c.id_dpto) === Number(deptoId))
      : this.ciudades();
    this.form.reset({
      nit: '',
      razon_social: '',
      direccion: '',
      email: '',
      telefono: '',
      id_ciudad: cities[0]?.id_ciudad ?? 0,
    });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(proveedor: Proveedor): void {
    this.editingId.set(proveedor.id_proveedor);
    const city = this.ciudades().find((c) => Number(c.id_ciudad) === Number(proveedor.id_ciudad));
    this.selectedDepto.set(city?.id_dpto ?? '');
    this.form.reset({
      nit: proveedor.nit,
      razon_social: proveedor.razon_social,
      direccion: proveedor.direccion ?? '',
      email: proveedor.email ?? '',
      telefono: proveedor.telefono ?? '',
      id_ciudad: proveedor.id_ciudad,
    });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEditFromDetail(proveedor: Proveedor): void {
    this.closeDetail();
    this.openEdit(proveedor);
  }

  openDetail(proveedor: Proveedor): void {
    this.detailProveedor.set(proveedor);
  }

  closeDetail(): void {
    this.detailProveedor.set(null);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      direccion: this.form.value.direccion || null,
      email: this.form.value.email || null,
      telefono: this.form.value.telefono || null,
      id_ciudad: Number(this.form.value.id_ciudad),
    };

    this.saving.set(true);
    this.formError.set(null);

    const id = this.editingId();
    const request = id ? this.proveedorService.update(id, payload) : this.proveedorService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
        this.toast.success(id ? 'Proveedor actualizado correctamente' : 'Proveedor creado correctamente');
      },
      error: (err: { error?: { message?: string } }) => {
        this.formError.set(err.error?.message ?? 'No fue posible guardar el proveedor');
        this.saving.set(false);
        this.toast.error(err.error?.message ?? 'Error al guardar el proveedor');
      },
    });
  }

  remove(proveedor: Proveedor): void {
    void this.confirm
      .confirm({
        title: 'Eliminar proveedor',
        message: `¿Está seguro de eliminar a "${proveedor.razon_social}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        type: 'danger',
      })
      .then((ok) => {
        if (!ok) return;
        this.proveedorService.remove(proveedor.id_proveedor).subscribe({
          next: () => {
            this.loadData();
            this.toast.success('Proveedor eliminado correctamente');
          },
          error: (err: { error?: { message?: string } }) => {
            this.toast.error(err.error?.message ?? 'No fue posible eliminar el proveedor');
          },
        });
      });
  }

  private sortByNewestRegistro(items: Proveedor[]): Proveedor[] {
    return [...items].sort((a, b) => {
      const aDate = a.fecha_registro ? new Date(a.fecha_registro).getTime() : 0;
      const bDate = b.fecha_registro ? new Date(b.fecha_registro).getTime() : 0;
      if (aDate !== bDate) {
        return bDate - aDate;
      }
      return Number(b.id_proveedor) - Number(a.id_proveedor);
    });
  }
}
