import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Categoria, Inventario, MovimientoStock, Proveedor, TipoMovimiento } from '../../core/models/database.model';
import { AuthService } from '../../core/services/auth.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioService } from '../../core/services/inventario.service';
import { MovimientoPayload, MovimientoService } from '../../core/services/movimiento.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { NumericInputDirective } from '../../shared/directives/numeric-input.directive';
import { ToastService } from '../../shared/services/toast.service';
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
    NumericInputDirective,
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
              Categoría<span class="required-mark">*</span>
              <select
                formControlName="id_categoria"
                class="form-input mt-1.5"
                [class.is-invalid]="invalid('id_categoria')"
                (change)="onCategoriaChange()"
              >
                <option [ngValue]="0">Seleccione...</option>
                @for (categoria of categorias(); track categoria.id_categoria) {
                  <option [ngValue]="categoria.id_categoria">{{ categoria.nombre_categoria }}</option>
                }
              </select>
              @if (invalid('id_categoria')) { <span class="form-error">Seleccione una categoría</span> }
            </label>
            <label class="form-label">
              Producto<span class="required-mark">*</span>
              <select formControlName="id_inventario" class="form-input mt-1.5" [class.is-invalid]="invalid('id_inventario')">
                <option [ngValue]="0">Seleccione...</option>
                @for (item of filteredInventario(); track item.id_inventario) {
                  <option [ngValue]="item.id_inventario">{{ item.producto }} ({{ item.cantidad }})</option>
                }
              </select>
              @if (invalid('id_inventario')) { <span class="form-error">Seleccione un producto</span> }
              @if (showNoProductsMessage()) { <span class="form-error">No existen productos para la categoría seleccionada</span> }
            </label>
            <label class="form-label">
              Cantidad<span class="required-mark">*</span>
              <input
                type="text"
                appNumericInput="int"
                formControlName="cantidad"
                class="form-input mt-1.5"
                [class.is-invalid]="invalid('cantidad')"
                inputmode="numeric"
                placeholder="0"
                (focus)="onCantidadFocus()"
                (blur)="onCantidadBlur()"
              />
              @if (invalid('cantidad')) { <span class="form-error">Ingrese una cantidad válida</span> }
            </label>
            <label class="form-label">
              Fecha<span class="required-mark">*</span>
              <input type="datetime-local" formControlName="fecha_movimiento" class="form-input mt-1.5" [class.is-invalid]="invalid('fecha_movimiento')" />
              @if (invalid('fecha_movimiento')) { <span class="form-error">Ingrese una fecha válida</span> }
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
                <div class="search-box min-w-[140px]">
                  <input type="search" [value]="search()" (input)="onSearch($event)" placeholder="Buscar..." class="form-input search-input w-full" />
                  <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  private readonly categoriaService = inject(CategoriaService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Movimientos' }];
  readonly inventario = signal<Inventario[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly movimientos = signal<MovimientoStock[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly tipoFilter = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly orderedMovimientos = computed(() => [...this.movimientos()].sort((a, b) => {
    const dateA = this.parseDate(a.fecha_movimiento).getTime();
    const dateB = this.parseDate(b.fecha_movimiento).getTime();
    if (dateA !== dateB) {
      return dateB - dateA;
    }
    return Number(b.id_movimiento) - Number(a.id_movimiento);
  }));

  readonly filteredInventario = computed(() => {
    const categoriaId = Number(this.form.controls.id_categoria.value);
    if (!categoriaId) {
      return [];
    }
    return this.inventario().filter((item) => Number(item.id_categoria) === categoriaId);
  });

  readonly showNoProductsMessage = computed(() =>
    Number(this.form.controls.id_categoria.value) > 0 && this.filteredInventario().length === 0,
  );

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    let items = this.orderedMovimientos();
    if (term) {
      items = items.filter((mov) => {
        const producto = this.productName(mov.id_inventario).toLowerCase();
        return (
          String(mov.observacion ?? '').toLowerCase().includes(term)
          || String(mov.tipo_movimiento ?? '').toLowerCase().includes(term)
          || String(mov.cantidad ?? '').toLowerCase().includes(term)
          || String(mov.fecha_movimiento ?? '').toLowerCase().includes(term)
          || producto.includes(term)
        );
      });
    }
    const tipo = this.tipoFilter();
    if (tipo) items = items.filter((mov) => mov.tipo_movimiento === tipo);
    return items;
  });

  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    tipo_movimiento: ['Entrada' as TipoMovimiento, Validators.required],
    id_categoria: [0, [Validators.required, Validators.min(1)]],
    id_inventario: [0, [Validators.required, Validators.min(1)]],
    cantidad: ['0', [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]],
    fecha_movimiento: [this.getCurrentDateTimeInput(), Validators.required],
    id_proveedor: [null as number | null],
    observacion: [''],
  });

  constructor() {
    forkJoin({
      inventario: this.inventarioService.list(),
      categorias: this.categoriaService.list(),
      proveedores: this.proveedorService.list(),
      movimientos: this.auth.isAdmin()
        ? this.movimientoService.list().pipe(catchError(() => of([] as MovimientoStock[])))
        : of([] as MovimientoStock[]),
    }).subscribe({
      next: ({ inventario, categorias, proveedores, movimientos }) => {
        this.inventario.set(inventario);
        this.categorias.set(categorias);
        this.proveedores.set(proveedores);
        this.movimientos.set(this.uniqueMovimientos(movimientos));
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

  onCategoriaChange(): void {
    this.form.patchValue({ id_inventario: 0 });
  }

  onCantidadFocus(): void {
    const cantidad = this.form.controls.cantidad.value.trim();
    if (cantidad === '0') {
      this.form.controls.cantidad.setValue('');
    }
  }

  onCantidadBlur(): void {
    const cantidad = this.form.controls.cantidad.value.trim();
    if (!cantidad) {
      this.form.controls.cantidad.setValue('0');
    }
  }

  productName(id: number): string {
    return this.inventario().find((item) => Number(item.id_inventario) === Number(id))?.producto ?? `Producto ${id}`;
  }

  register(): void {
    if (this.saving()) {
      return;
    }

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
      fecha_movimiento: this.toSqlDateTime(raw.fecha_movimiento),
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
        this.form.patchValue({ cantidad: '0', fecha_movimiento: this.getCurrentDateTimeInput(), observacion: '', id_proveedor: null });
        this.reloadInventarioAndHistory();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('movimientos:updated'));
        }
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
    this.inventarioService.list().subscribe((inventario) => {
      this.inventario.set(inventario);
      const selectedCategoria = Number(this.form.controls.id_categoria.value);
      const selectedProducto = Number(this.form.controls.id_inventario.value);
      const hasSelectedProduct = inventario.some(
        (item) => Number(item.id_categoria) === selectedCategoria && Number(item.id_inventario) === selectedProducto,
      );
      if (!hasSelectedProduct) {
        this.form.patchValue({ id_inventario: 0 });
      }
    });

    if (this.auth.isAdmin()) {
      this.movimientoService.list().subscribe({
        next: (movimientos) => this.movimientos.set(this.uniqueMovimientos(movimientos)),
        error: () => this.movimientos.set([]),
      });
    }
  }

  private uniqueMovimientos(items: MovimientoStock[]): MovimientoStock[] {
    const seen = new Set<number>();
    const unique: MovimientoStock[] = [];
    for (const item of items) {
      const id = Number(item.id_movimiento);
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
      unique.push(item);
    }
    return unique;
  }

  private parseDate(value: string): Date {
    return new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  }

  private getCurrentDateTimeInput(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toSqlDateTime(value: string): string {
    return value ? `${value}:00`.replace('T', ' ') : this.getCurrentDateTimeInput().replace('T', ' ') + ':00';
  }
}
