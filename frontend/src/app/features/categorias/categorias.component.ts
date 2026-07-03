import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../core/models/database.model';
import { CategoriaService } from '../../core/services/categoria.service';
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

@Component({
  selector: 'app-categorias',
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
        title="Categorías"
        subtitle="Clasificación de productos del inventario"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="categorias().length"
        [filteredCount]="filtered().length"
      >
        <button actions type="button" (click)="openCreate()" class="btn-primary">
          Nueva categoría
        </button>
      </app-page-header>

      <div class="card overflow-hidden">
        <div class="card-header">
          <div class="max-w-md w-full relative">
            <input
              type="search"
              [value]="search()"
              (input)="onSearch($event)"
              placeholder="Buscar categoría..."
              class="form-input w-full pl-10"
            />
            <svg class="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        @if (loading()) {
          <app-skeleton-table [rows]="5" [cols]="3" />
        } @else if (!filtered().length) {
          <app-empty-state
            [type]="search() ? 'search' : 'categories'"
            [title]="search() ? 'Sin resultados' : 'No hay categorías registradas'"
            [description]="search() ? 'No se encontraron categorías con ese criterio de búsqueda.' : 'Comience creando la primera categoría para organizar sus productos.'"
            [hint]="search() ? 'Intente con otro término' : null"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="table-modern w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Nombre</th>
                  <th class="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (categoria of pageItems(); track categoria.id_categoria) {
                  <tr>
                    <td class="px-4 py-3 text-zinc-400">{{ categoria.id_categoria }}</td>
                    <td class="px-4 py-3 font-medium text-zinc-100">{{ categoria.nombre_categoria }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        <button type="button" (click)="openEdit(categoria)" class="btn-ghost">Editar</button>
                        <button type="button" (click)="remove(categoria)" class="btn-danger">Eliminar</button>
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
          <form [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()" class="modal-content max-w-md">
            <h3 class="text-lg font-semibold text-white">{{ editingId() ? 'Editar categoría' : 'Nueva categoría' }}</h3>

            @if (formError()) {
              <p class="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{{ formError() }}</p>
            }

            <label class="form-label mt-4">
              Nombre<span class="required-mark">*</span>
              <input formControlName="nombre_categoria" class="form-input mt-1.5" [class.is-invalid]="invalid('nombre_categoria')" />
              @if (invalid('nombre_categoria')) { <span class="form-error">El nombre es obligatorio</span> }
            </label>

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
export class CategoriasComponent {
  private readonly fb = inject(FormBuilder);
  private readonly categoriaService = inject(CategoriaService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Categorías' }];
  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);

  readonly filtered = computed(() => filterBySearch(this.categorias(), this.search(), ['nombre_categoria']));
  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  readonly form = this.fb.nonNullable.group({
    nombre_categoria: ['', Validators.required],
  });

  constructor() {
    this.loadData();
  }

  invalid(field: string): boolean {
    return isFieldInvalid(this.form, field);
  }

  loadData(): void {
    this.loading.set(true);
    this.categoriaService.list().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar las categorías');
      },
    });
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ nombre_categoria: '' });
    this.formError.set(null);
    this.modalOpen.set(true);
  }

  openEdit(categoria: Categoria): void {
    this.editingId.set(categoria.id_categoria);
    this.form.reset({ nombre_categoria: categoria.nombre_categoria });
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

    const payload = this.form.getRawValue();
    this.saving.set(true);
    this.formError.set(null);

    const id = this.editingId();
    const request = id ? this.categoriaService.update(id, payload) : this.categoriaService.create(payload);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
        this.toast.success(id ? 'Categoría actualizada' : 'Categoría creada');
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err.error?.message ?? 'No fue posible guardar la categoría';
        this.formError.set(msg);
        this.toast.error(msg);
        this.saving.set(false);
      },
    });
  }

  remove(categoria: Categoria): void {
    void this.confirm
      .confirm({
        title: 'Eliminar categoría',
        message: `¿Está seguro de eliminar "${categoria.nombre_categoria}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        type: 'danger',
      })
      .then((ok) => {
        if (!ok) return;
        this.categoriaService.remove(categoria.id_categoria).subscribe({
          next: () => {
            this.loadData();
            this.toast.success('Categoría eliminada');
          },
          error: (err: { error?: { message?: string } }) =>
            this.toast.error(err.error?.message ?? 'No fue posible eliminar'),
        });
      });
  }
}
