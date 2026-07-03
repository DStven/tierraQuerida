import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Inventario, MovimientoStock, Proveedor, TipoMovimiento } from '../../core/models/database.model';
import { AuthService } from '../../core/services/auth.service';
import { InventarioService } from '../../core/services/inventario.service';
import { MovimientoPayload, MovimientoService } from '../../core/services/movimiento.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { ToastService } from '../../shared/services/toast.service';
import { filterBySearch } from '../../shared/utils/filter.util';
import { debounce } from '../../shared/utils/debounce.util';
import { isFieldInvalid } from '../../shared/utils/form.util';
import { buildPagination, paginate } from '../../shared/utils/pagination.util';

@Component({
  selector: 'app-movimientos',
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
    <section class="mx-auto max-w-7xl space-y-6">
      <app-page-header
        title="Movimientos de stock"
        subtitle="Registra entradas y salidas de materia prima"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="auth.isAdmin() ? movimientos().length : null"
        [filteredCount]="auth.isAdmin() ? filtered().length : null"
      />

      <div class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form [formGroup]="form" (ngSubmit)="register()" class="card p-5">
          <h3 class="font-semibold text-white">Registrar movimiento</h3>
          <p class="mt-1 text-xs text-zinc-500">Los campos marcados con <span class="required-mark">*</span> son obligatorios</p>

          @if (formError()) {
            <p class="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{{ formError() }}</p>
          }

          <div class="mt-4 grid gap-3">
            <label class="form-label">
              Tipo<span class="required-mark">*</span>
              <select formControlName="tipo_movimiento" class="form-input mt-1.5">
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
              </select>
            </label>
            <label class="form-label">
              Producto<span class="required-mark">*</span>
              <select formControlName="id_inventario" class="form-input mt-1.5" [class.is-invalid]="invalid('id_inventario')">
                @for (item of inventario(); track item.id_inventario) {
                  <option [value]="item.id_inventario">{{ item.producto }} ({{ item.cantidad }})</option>
                }
              </select>
            </label>
            <label class="form-label">
              Cantidad<span class="required-mark">*</span>
              <input type="number" min="1" formControlName="cantidad" class="form-input mt-1.5" [class.is-invalid]="invalid('cantidad')" />
              @if (invalid('cantidad')) { <span class="form-error">Ingrese una cantidad válida</span> }
            </label>
            @if (form.value.tipo_movimiento === 'Entrada') {
              <label class="form-label">
                Proveedor (opcional)
                <select formControlName="id_proveedor" class="form-input mt-1.5">
                  <option [ngValue]="null">Sin proveedor</option>
                  @for (proveedor of proveedores(); track proveedor.id_proveedor) {
                    <option [ngValue]="proveedor.id_proveedor">{{ proveedor.razon_social }}</option>
                  }
                </select>
              </label>
            }
            <label class="form-label">
              Observación
              <textarea formControlName="observacion" rows="3" class="form-input mt-1.5"></textarea>
            </label>
          </div>

          <button type="submit" [disabled]="form.invalid || saving()" class="btn-primary mt-5 w-full">
            @if (saving()) { <app-spinner size="sm" /> Registrando... } @else { Registrar movimiento }
          </button>
        </form>

        @if (auth.isAdmin()) {
          <div class="card overflow-hidden">
            <div class="card-header">
              <h3 class="font-semibold text-white">Historial</h3>
              <div class="flex flex-wrap gap-2">
                <div class="min-w-[140px] relative">
                <input type="search" [value]="search()" (input)="onSearch($event)" placeholder="Buscar..." class="form-input w-full pl-10" />
                <svg class="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
                <select [value]="tipoFilter()" (change)="onTipoFilter($event)" class="form-input w-auto">
                  <option value="">Todos</option>
                  <option value="Entrada">Entradas</option>
                  <option value="Salida">Salidas</option>
                </select>
              </div>
            </div>

            @if (loading()) {
              <app-skeleton-table [rows]="5" [cols]="5" />
            } @else if (!filtered().length) {
              <app-empty-state
                [type]="search() || tipoFilter() ? 'search' : 'movements'"
                [title]="search() || tipoFilter() ? 'Sin resultados' : 'Sin movimientos registrados'"
                [description]="search() || tipoFilter() ? 'No hay movimientos que coincidan con los filtros.' : 'Los movimientos de entrada y salida aparecerán aquí.'"
              />
            } @else {
              <div class="overflow-x-auto">
                <table class="table-modern w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr class="border-b border-white/[0.06]">
                      <th class="px-4 py-3 font-medium">Fecha</th>
                      <th class="px-4 py-3 font-medium">Producto</th>
                      <th class="px-4 py-3 font-medium">Tipo</th>
                      <th class="px-4 py-3 font-medium">Cantidad</th>
                      <th class="px-4 py-3 font-medium">Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (mov of pageItems(); track mov.id_movimiento) {
                      <tr>
                        <td class="px-4 py-3 whitespace-nowrap text-zinc-400">{{ mov.fecha_movimiento }}</td>
                        <td class="px-4 py-3 font-medium text-zinc-200">{{ productName(mov.id_inventario) }}</td>
                        <td class="px-4 py-3">
                          <span class="badge" [class.badge-success]="mov.tipo_movimiento === 'Entrada'" [class.badge-danger]="mov.tipo_movimiento === 'Salida'">
                            {{ mov.tipo_movimiento }}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-zinc-300">{{ mov.cantidad }}</td>
                        <td class="px-4 py-3 text-zinc-400">{{ mov.observacion || '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="border-t border-white/[0.06] p-4">
                <app-pagination [state]="pagination()" (pageChange)="setPage($event)" />
              </div>
            }
          </div>
        } @else {
          <div class="card flex flex-col items-center justify-center p-8 text-center">
            <app-empty-state
              type="movements"
              title="Historial restringido"
              description="El historial completo de movimientos está disponible solo para administradores. Puede registrar entradas y salidas desde el formulario."
            />
          </div>
        }
      </div>
    </section>
  `,
})
export class MovimientosComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly movimientoService = inject(MovimientoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Movimientos' }];
  readonly inventario = signal<Inventario[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly movimientos = signal<MovimientoStock[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly tipoFilter = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly filtered = computed(() => {
    let items = filterBySearch(this.movimientos(), this.search(), ['observacion', 'tipo_movimiento']);
    const tipo = this.tipoFilter();
    if (tipo) items = items.filter((mov) => mov.tipo_movimiento === tipo);
    return items;
  });

  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    tipo_movimiento: ['Entrada' as TipoMovimiento, Validators.required],
    id_inventario: [0, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    id_proveedor: [null as number | null],
    observacion: [''],
  });

  constructor() {
    forkJoin({
      inventario: this.inventarioService.list(),
      proveedores: this.proveedorService.list(),
      movimientos: this.auth.isAdmin()
        ? this.movimientoService.list().pipe(catchError(() => of([] as MovimientoStock[])))
        : of([] as MovimientoStock[]),
    }).subscribe({
      next: ({ inventario, proveedores, movimientos }) => {
        this.inventario.set(inventario);
        this.proveedores.set(proveedores);
        this.movimientos.set(movimientos);
        if (inventario.length) this.form.patchValue({ id_inventario: inventario[0].id_inventario });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar los datos');
      },
    });
  }

  invalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  onTipoFilter(event: Event): void {
    this.tipoFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  productName(id: number): string {
    return this.inventario().find((item) => Number(item.id_inventario) === Number(id))?.producto ?? `Producto ${id}`;
  }

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning('Complete los campos obligatorios');
      return;
    }

    const raw = this.form.getRawValue();
    const userId = this.auth.currentUser()?.id_usuario;

    const payload: MovimientoPayload = {
      tipo_movimiento: raw.tipo_movimiento,
      cantidad: Number(raw.cantidad),
      observacion: raw.observacion || null,
      id_inventario: Number(raw.id_inventario),
      id_proveedor: raw.tipo_movimiento === 'Entrada' ? raw.id_proveedor : null,
      id_usuario: userId,
    };

    this.saving.set(true);
    this.formError.set(null);

    this.movimientoService.create(payload).subscribe({
      next: (data) => {
        this.saving.set(false);
        this.toast.success(`Movimiento registrado. Stock: ${data.stock_anterior} → ${data.stock_actual}`);
        this.form.patchValue({ cantidad: 1, observacion: '', id_proveedor: null });
        this.reloadInventarioAndHistory();
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err.error?.message ?? 'No fue posible registrar el movimiento';
        this.formError.set(msg);
        this.toast.error(msg);
        this.saving.set(false);
      },
    });
  }

  private reloadInventarioAndHistory(): void {
    this.inventarioService.list().subscribe((inventario) => this.inventario.set(inventario));
    if (this.auth.isAdmin()) {
      this.movimientoService.list().subscribe({
        next: (movimientos) => this.movimientos.set(movimientos),
        error: () => this.movimientos.set([]),
      });
    }
  }
}
