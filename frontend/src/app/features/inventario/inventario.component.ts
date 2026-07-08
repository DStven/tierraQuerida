import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Categoria, Inventario, Producto, EstadoInventario } from '../../core/models/database.model';
import { AuthService } from '../../core/services/auth.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioPayload, InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
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
import { NumericInputDirective } from '../../shared/directives/numeric-input.directive';

@Component({
  selector: 'app-inventario',
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
    <section class="mx-auto max-w-7xl space-y-5">
      <app-page-header
        title="Inventario"
        subtitle="Productos y niveles de stock"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="inventario().length"
        [filteredCount]="filtered().length"
      >
        @if (canManage()) {
          <button actions type="button" (click)="openCreate()" class="btn-primary">Nuevo registro de inventario</button>
        }
      </app-page-header>

      <div class="flex flex-wrap gap-3">
        <div class="search-box max-w-md w-full">
          <input 
            type="search" 
            [value]="search()" 
            (input)="onSearch($event)" 
            placeholder="Buscar producto..." 
            class="form-input search-input w-full"
          />
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <select [value]="estadoFilter()" (change)="onEstadoFilter($event)" class="form-input w-full min-w-0 sm:w-auto sm:min-w-[160px]">
          <option value="">Todos los estados</option>
          <option value="Disponible">Disponible</option>
          <option value="Agotado">Agotado</option>
          <option value="low">Stock mínimo</option>
        </select>
        <select [value]="categoriaFilter()" (change)="onCategoriaFilter($event)" class="form-input w-full min-w-0 sm:w-auto sm:min-w-[160px]">
          <option value="">Todas las categorías</option>
          @for (categoria of categorias(); track categoria.id_categoria) {
            <option [value]="categoria.id_categoria">{{ categoria.nombre_categoria }}</option>
          }
        </select>
      </div>

      <div class="card overflow-hidden">
        @if (loading()) {
          <app-skeleton-table [rows]="6" [cols]="8" />
        } @else if (!filtered().length) {
          <app-empty-state
            [type]="hasFilters() ? 'search' : 'inventory'"
            [title]="hasFilters() ? 'Sin resultados' : 'No hay productos en inventario'"
            [description]="hasFilters() ? 'No se encontraron productos con los filtros aplicados.' : 'Agregue productos al inventario para comenzar a gestionar el stock.'"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="table-modern w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="px-4 py-3 font-medium">Producto</th>
                  <th class="px-4 py-3 font-medium">Categoría</th>
                  <th class="px-4 py-3 font-medium">Precio</th>
                  <th class="px-4 py-3 font-medium">Cantidad</th>
                  <th class="px-4 py-3 font-medium">Stock mínimo</th>
                  <th class="px-4 py-3 font-medium">Estado</th>
                  @if (canManage()) { <th class="px-4 py-3 font-medium">Acciones</th> }
                </tr>
              </thead>
              <tbody>
                @for (item of pageItems(); track item.id_inventario) {
                  <tr [class.bg-amber-500/5]="isLowStock(item)">
                    <td class="px-4 py-3 font-medium text-zinc-100">{{ item.producto }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ categoryName(item.id_categoria) }}</td>
                    <td class="px-4 py-3 text-zinc-300">{{ item.precio_unitario ?? '—' }}</td>
                    <td class="px-4 py-3" [class.text-amber-200]="isLowStock(item)">{{ item.cantidad }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ item.stock_minimo }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <span class="badge" [class.badge-success]="isDisponible(item.estado)" [class.badge-danger]="!isDisponible(item.estado)">
                          {{ formatEstado(item.estado) }}
                        </span>
                        @if (isLowStock(item)) { <span class="badge badge-warning">Stock bajo</span> }
                      </div>
                    </td>
                    @if (canManage()) {
                      <td class="px-4 py-3">
                        <div class="flex flex-wrap gap-2">
                          <button type="button" (click)="openEdit(item)" class="btn-ghost">Editar</button>
                          @if (auth.isAdmin()) {
                            <button type="button" (click)="remove(item)" class="btn-danger">Eliminar</button>
                          }
                        </div>
                      </td>
                    }
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

      @if (modalOpen()) {
        <div class="modal-overlay" (click)="closeModal()">
          <form [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()" class="modal-content max-w-lg">
            <div class="modal-header">
              <div>
                <h3 class="modal-title">{{ editingId() ? 'Editar producto en inventario' : 'Agregar al inventario' }}</h3>
                <p class="modal-subtitle">Configure los datos base del inventario</p>
              </div>
              <button type="button" (click)="closeModal()" class="modal-close" aria-label="Cerrar modal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            @if (formError()) {
              <p class="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{{ formError() }}</p>
            }
            <div class="modal-form-grid sm:grid-cols-2">
              <label class="form-label sm:col-span-2">
                Categoría<span class="required-mark">*</span>
                <select
                  formControlName="id_categoria"
                  (change)="onCategoriaChange()"
                  class="form-input mt-1.5"
                  [class.is-invalid]="invalid('id_categoria')"
                  aria-label="Seleccionar categoría"
                  required
                >
                  <option [ngValue]="0">Seleccione una categoría...</option>
                  @for (categoria of categorias(); track categoria.id_categoria) {
                    <option [ngValue]="categoria.id_categoria">{{ categoria.nombre_categoria }}</option>
                  }
                </select>
                @if (invalid('id_categoria')) { <span class="form-error">Seleccione una categoría</span> }
              </label>
              <label class="form-label sm:col-span-2">
                Producto<span class="required-mark">*</span>
                <div class="relative">
                  <select
                    formControlName="id_producto"
                    class="form-input mt-1.5"
                    [disabled]="!form.getRawValue().id_categoria || productsLoading()"
                    [class.is-invalid]="invalid('id_producto')"
                  >
                    <option [ngValue]="0">Seleccione un producto...</option>
                    @for (product of products(); track product.id_producto) {
                      <option [ngValue]="product.id_producto">{{ product.nombre }}</option>
                    }
                  </select>
                  @if (productsLoading()) {
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">Cargando...</span>
                  }
                </div>
                @if (invalid('id_producto')) { <span class="form-error">Seleccione un producto</span> }
                @if (form.getRawValue().id_categoria && !productsLoading() && products().length === 0) {
                  <span class="form-error">No hay productos registrados para esta categoría.</span>
                }
              </label>
              <label class="form-label">
                Cantidad inicial<span class="required-mark">*</span>
                <input 
                  type="text" 
                  appNumericInput="int"
                  formControlName="cantidad" 
                  class="form-input mt-1.5" 
                  [class.is-invalid]="invalid('cantidad')"
                  inputmode="numeric"
                  placeholder="0"
                />
              </label>
              <label class="form-label">
                Stock mínimo<span class="required-mark">*</span>
                <input 
                  type="text" 
                  appNumericInput="int"
                  formControlName="stock_minimo" 
                  class="form-input mt-1.5" 
                  [class.is-invalid]="invalid('stock_minimo')"
                  inputmode="numeric"
                  placeholder="0"
                />
              </label>
              <label class="form-label sm:col-span-2">
                Estado<span class="required-mark">*</span>
                <select formControlName="estado" class="form-input mt-1.5">
                  <option value="Disponible">Disponible</option>
                  <option value="Agotado">Agotado</option>
                </select>
              </label>
            </div>
            <div class="modal-footer">
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
export class InventarioComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly inventarioService = inject(InventarioService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Inventario' }];
  readonly inventario = signal<Inventario[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly products = signal<Producto[]>([]);
  readonly productsLoading = signal(false);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly estadoFilter = signal('');
  readonly categoriaFilter = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly canManage = computed(() => this.auth.isAdmin() || this.auth.isEmpleado());

  readonly filtered = computed(() => {
    let items = filterBySearch(this.inventario(), this.search(), ['producto']);
    const estado = this.estadoFilter();
    if (estado === 'low') items = items.filter((item) => this.isLowStock(item));
    else if (estado) items = items.filter((item) => this.formatEstado(item.estado) === estado);
    const categoriaId = this.categoriaFilter();
    if (categoriaId) items = items.filter((item) => String(item.id_categoria) === categoriaId);
    return items;
  });

  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    id_categoria: [0, [Validators.required, Validators.min(1)]],
    id_producto: [0, [Validators.required, Validators.min(1)]],
    cantidad: ['0', [Validators.required, Validators.min(0)]],
    stock_minimo: ['0', [Validators.required, Validators.min(0)]],
    estado: ['Disponible' as EstadoInventario, Validators.required],
  });

  constructor() {
    this.loadData();
  }

  invalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  private getProductById(id: number): Producto | undefined {
    return this.products().find((product) => Number(product.id_producto) === Number(id));
  }

  private loadProducts(categoryId: number, selectedProductName?: string): void {
    if (!categoryId) {
      this.products.set([]);
      return;
    }

    this.productsLoading.set(true);
    this.productoService.list({ id_categoria: categoryId }).subscribe({
      next: (productos) => {
        this.products.set(productos);
        if (selectedProductName) {
          const selected = productos.find((product) => product.nombre === selectedProductName);
          if (selected) {
            this.form.patchValue({ id_producto: selected.id_producto });
          }
        }
      },
      error: () => {
        this.products.set([]);
        this.toast.error('No fue posible cargar los productos de la categoría seleccionada');
      },
      complete: () => {
        this.productsLoading.set(false);
      },
    });
  }

  hasFilters(): boolean {
    return Boolean(this.search() || this.estadoFilter() || this.categoriaFilter());
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      inventario: this.inventarioService.list(),
      categorias: this.categoriaService.list(),
    }).subscribe({
      next: ({ inventario, categorias }) => {
        this.inventario.set(inventario);
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar el inventario');
      },
    });
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  onCategoriaChange(): void {
    const categoryId = Number(this.form.getRawValue().id_categoria || 0);
    this.form.patchValue({ id_producto: 0 });
    this.loadProducts(categoryId);
  }

  onEstadoFilter(event: Event): void {
    this.estadoFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  onCategoriaFilter(event: Event): void {
    this.categoriaFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  categoryName(id: number): string {
    return this.categorias().find((c) => Number(c.id_categoria) === Number(id))?.nombre_categoria ?? `Categoría ${id}`;
  }

  isLowStock(item: Inventario): boolean {
    return Number(item.cantidad) <= Number(item.stock_minimo);
  }

  isDisponible(estado: Inventario['estado']): boolean {
    return estado === 'Disponible' || estado === 1 || estado === true || String(estado).toLowerCase() === 'disponible';
  }

  formatEstado(estado: Inventario['estado']): string {
    return this.isDisponible(estado) ? 'Disponible' : 'Agotado';
  }

  openCreate(): void {
    this.editingId.set(null);
    this.products.set([]);
    this.form.reset({
      id_categoria: 0,
      id_producto: 0,
      cantidad: '0',
      stock_minimo: '0',
      estado: 'Disponible',
    });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(item: Inventario): void {
    this.editingId.set(item.id_inventario);
    this.form.reset({
      id_categoria: item.id_categoria,
      id_producto: 0,
      cantidad: String(item.cantidad),
      stock_minimo: String(item.stock_minimo),
      estado: this.isDisponible(item.estado) ? 'Disponible' : 'Agotado',
    });
    this.loadProducts(item.id_categoria, item.producto);
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
    const selectedProduct = this.getProductById(raw.id_producto);

    if (!selectedProduct) {
      this.formError.set('Seleccione un producto válido');
      return;
    }

    const payload: InventarioPayload = {
      producto: selectedProduct.nombre,
      cantidad: Number(raw.cantidad) || 0,
      stock_minimo: Number(raw.stock_minimo) || 0,
      unidad_medida: null,
      precio_unitario: selectedProduct.precio_unitario ?? 0,
      estado: raw.estado,
      id_categoria: Number(selectedProduct.id_categoria),
    };

    this.saving.set(true);
    this.formError.set(null);

    const id = this.editingId();
    const request = id ? this.inventarioService.update(id, payload) : this.inventarioService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
        this.toast.success(id ? 'Producto actualizado' : 'Producto registrado en inventario');
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err.error?.message ?? 'No fue posible guardar el inventario';
        this.formError.set(msg);
        this.toast.error(msg);
        this.saving.set(false);
      },
    });
  }

  remove(item: Inventario): void {
    void this.confirm
      .confirm({
        title: 'Eliminar producto',
        message: `¿Está seguro de eliminar "${item.producto}" del inventario?`,
        confirmText: 'Eliminar',
        type: 'danger',
      })
      .then((ok) => {
        if (!ok) return;
        this.inventarioService.remove(item.id_inventario).subscribe({
          next: () => {
            this.loadData();
            this.toast.success('Producto eliminado del inventario');
          },
          error: (err: { error?: { message?: string } }) =>
            this.toast.error(err.error?.message ?? 'No fue posible eliminar'),
        });
      });
  }
}
