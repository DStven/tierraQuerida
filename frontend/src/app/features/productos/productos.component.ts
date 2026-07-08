import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Categoria, Producto } from '../../core/models/database.model';
import { AuthService } from '../../core/services/auth.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ToastService } from '../../shared/services/toast.service';
import { debounce } from '../../shared/utils/debounce.util';
import { isFieldInvalid } from '../../shared/utils/form.util';
import { buildPagination, paginate } from '../../shared/utils/pagination.util';
import { NumericInputDirective } from '../../shared/directives/numeric-input.directive';

@Component({
  selector: 'app-productos',
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
        title="Productos"
        subtitle="Gestione productos y su categoría"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="productos().length"
        [filteredCount]="filtered().length"
      >
        <button actions type="button" (click)="openCreate()" class="btn-primary">Nuevo producto</button>
      </app-page-header>

      <div class="card overflow-hidden">
        <div class="card-header">
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
        </div>

        @if (loading()) {
          <app-skeleton-table [rows]="6" [cols]="6" />
        } @else if (!filtered().length) {
          <app-empty-state
            [type]="search() ? 'search' : 'products'"
            [title]="search() ? 'Sin resultados' : 'No hay productos registrados'"
            [description]="search() ? 'No se encontraron productos con ese criterio.' : 'Registre productos para gestionar el catálogo del inventario.'"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="table-modern w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Nombre</th>
                  <th class="px-4 py-3 font-medium">Descripción</th>
                  <th class="px-4 py-3 font-medium">Precio</th>
                  <th class="px-4 py-3 font-medium">Categoría</th>
                  <th class="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (producto of pageItems(); track producto.id_producto) {
                  <tr>
                    <td class="px-4 py-3 text-zinc-400">{{ producto.id_producto }}</td>
                    <td class="px-4 py-3 font-medium text-zinc-100">{{ producto.nombre }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ producto.descripcion || '—' }}</td>
                    <td class="px-4 py-3 text-zinc-300">{{ producto.precio_unitario }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ getCategoriaName(producto.id_categoria) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-2">
                        <button type="button" (click)="openEdit(producto)" class="btn-ghost">Editar</button>
                        @if (auth.isAdmin()) {
                          <button type="button" (click)="remove(producto)" class="btn-danger">Eliminar</button>
                        }
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
            <div class="modal-header">
              <div>
                <h3 class="modal-title">{{ editingId() ? 'Editar producto' : 'Nuevo producto' }}</h3>
                <p class="modal-subtitle">Complete la información del producto</p>
              </div>
              <button type="button" (click)="closeModal()" class="modal-close" aria-label="Cerrar modal">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            @if (formError()) {
              <p class="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{{ formError() }}</p>
            }
            <div class="modal-form-grid md:grid-cols-2">
              <label class="form-label md:col-span-2">
                Nombre<span class="required-mark">*</span>
                <input formControlName="nombre" class="form-input mt-1.5" [class.is-invalid]="invalid('nombre')" />
                @if (invalid('nombre')) { <span class="form-error">Campo obligatorio</span> }
              </label>
              <label class="form-label md:col-span-2">
                Descripción
                <textarea formControlName="descripcion" rows="3" class="form-input mt-1.5"></textarea>
              </label>
              <label class="form-label">
                Precio unitario<span class="required-mark">*</span>
                <input 
                  type="text" 
                  appNumericInput="decimal"
                  formControlName="precio_unitario" 
                  class="form-input mt-1.5" 
                  [class.is-invalid]="invalid('precio_unitario')"
                  (focus)="onPrecioFocus()"
                  (blur)="onPrecioBlur()"
                  inputmode="decimal"
                  placeholder="0"
                />
                @if (invalid('precio_unitario')) { <span class="form-error">Ingrese un precio valido</span> }
              </label>
              <label class="form-label">
                Categoría<span class="required-mark">*</span>
                <select formControlName="id_categoria" class="form-input mt-1.5" [class.is-invalid]="invalid('id_categoria')">
                  <option [ngValue]="0">Seleccione...</option>
                  @for (categoria of categorias(); track categoria.id_categoria) {
                    <option [ngValue]="categoria.id_categoria">{{ categoria.nombre_categoria }}</option>
                  }
                </select>
                @if (invalid('id_categoria')) { <span class="form-error">Seleccione una categoría</span> }
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
export class ProductosComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Productos' }];
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      return this.productos();
    }

    const categoriasById = new Map(
      this.categorias().map((categoria) => [categoria.id_categoria, categoria.nombre_categoria.toLowerCase()]),
    );

    return this.productos().filter((producto) => {
      const categoriaNombre = categoriasById.get(Number(producto.id_categoria)) ?? '';
      return (
        String(producto.nombre ?? '').toLowerCase().includes(term) ||
        String(producto.descripcion ?? '').toLowerCase().includes(term) ||
        String(producto.id_producto ?? '').toLowerCase().includes(term) ||
        String(producto.precio_unitario ?? '').toLowerCase().includes(term) ||
        categoriaNombre.includes(term)
      );
    });
  });
  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    precio_unitario: ['0', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), Validators.min(0)]],
    id_categoria: [0, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    this.loadData();
  }

  invalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({ productos: this.productoService.list(), categorias: this.categoriaService.list() }).subscribe({
      next: ({ productos, categorias }) => {
        this.productos.set(productos.map((producto) => ({ ...producto, id_categoria: Number(producto.id_categoria) })));
        this.categorias.set(categorias.map((categoria) => ({ ...categoria, id_categoria: Number(categoria.id_categoria) })));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar los productos');
      },
    });
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  onPrecioFocus(): void {
    const currentValue = this.form.controls.precio_unitario.value.trim();
    if (currentValue === '0') {
      this.form.controls.precio_unitario.setValue('');
    }
  }

  onPrecioBlur(): void {
    const currentValue = this.form.controls.precio_unitario.value.trim();
    if (currentValue === '') {
      this.form.controls.precio_unitario.setValue('0');
    }
  }

  getCategoriaName(id: number): string {
    return this.categorias().find((c) => c.id_categoria === id)?.nombre_categoria ?? 'Sin categoría';
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ nombre: '', descripcion: '', precio_unitario: '0', id_categoria: 0 });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(producto: Producto): void {
    this.editingId.set(producto.id_producto);
    this.form.reset({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio_unitario: String(producto.precio_unitario ?? 0),
      id_categoria: Number(producto.id_categoria),
    });
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

    const rawPayload = this.form.getRawValue();
    const payload = {
      ...rawPayload,
      precio_unitario: Number(rawPayload.precio_unitario),
      id_categoria: Number(rawPayload.id_categoria),
    };
    this.saving.set(true);
    this.formError.set(null);

    const id = this.editingId();
    const request = id ? this.productoService.update(id, payload) : this.productoService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
        this.toast.success(id ? 'Producto actualizado' : 'Producto creado');
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err.error?.message ?? 'No fue posible guardar el producto';
        this.formError.set(msg);
        this.toast.error(msg);
        this.saving.set(false);
      },
    });
  }

  remove(producto: Producto): void {
    void this.confirm
      .confirm({
        title: 'Eliminar producto',
        message: `¿Está seguro de eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        type: 'danger',
      })
      .then((ok) => {
        if (!ok) return;
        this.productoService.remove(producto.id_producto).subscribe({
          next: () => {
            this.loadData();
            this.toast.success('Producto eliminado');
          },
          error: (err: { error?: { message?: string } }) =>
            this.toast.error(err.error?.message ?? 'No fue posible eliminar'),
        });
      });
  }
}
