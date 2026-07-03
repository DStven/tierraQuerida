import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Auditoria } from '../../core/models/database.model';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { PaginationComponent } from '../../shared/components/pagination.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { ToastService } from '../../shared/services/toast.service';
import { filterBySearch } from '../../shared/utils/filter.util';
import { debounce } from '../../shared/utils/debounce.util';
import { buildPagination, paginate } from '../../shared/utils/pagination.util';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, PaginationComponent, PageHeaderComponent, EmptyStateComponent, SkeletonTableComponent],
  template: `
    <section class="mx-auto max-w-7xl space-y-5">
      <app-page-header
        title="Auditoría"
        subtitle="Registro de acciones del sistema"
        [breadcrumbs]="breadcrumbs"
        [totalCount]="auditorias().length"
        [filteredCount]="filtered().length"
      />

      <div class="card overflow-hidden">
        <div class="card-header">
          <div class="max-w-md w-full">
            <input
              type="search"
              [value]="search()"
              (input)="onSearch($event)"
              placeholder="Buscar por acción o descripción..."
              class="form-input w-full"
            />
          </div>
        </div>

        @if (loading()) {
          <app-skeleton-table [rows]="6" [cols]="5" />
        } @else if (!filtered().length) {
          <app-empty-state
            [type]="search() ? 'search' : 'audit'"
            [title]="search() ? 'Sin resultados' : 'No hay registros de auditoría'"
            [description]="search() ? 'No se encontraron registros con ese criterio.' : 'Las acciones del sistema aparecerán aquí cuando se registren cambios.'"
          />
        } @else {
          <div class="overflow-x-auto">
            <table class="table-modern w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr class="border-b border-white/[0.06]">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Acción</th>
                  <th class="px-4 py-3 font-medium">Descripción</th>
                  <th class="px-4 py-3 font-medium">Usuario</th>
                  <th class="px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                @for (item of pageItems(); track item.id_auditoria) {
                  <tr>
                    <td class="px-4 py-3 text-zinc-400">{{ item.id_auditoria }}</td>
                    <td class="px-4 py-3 font-medium text-zinc-200">{{ item.accion }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ item.descripcion || '—' }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ item.id_usuario ?? 'Sistema' }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-zinc-400">{{ item.fecha | date:'short' }}</td>
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
    </section>
  `,
})
export class AuditoriaComponent {
  private readonly auditoriaService = inject(AuditoriaService);
  private readonly toast = inject(ToastService);

  private readonly applySearch = debounce((value: string) => {
    this.search.set(value);
    this.page.set(1);
  }, 300);

  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Auditoría' }];
  readonly auditorias = signal<Auditoria[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly filtered = computed(() => filterBySearch(this.auditorias(), this.search(), ['accion', 'descripcion']));
  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.auditoriaService.list().subscribe({
      next: (auditorias) => {
        this.auditorias.set(auditorias);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No fue posible cargar la auditoría');
      },
    });
  }

  onSearch(event: Event): void {
    this.applySearch((event.target as HTMLInputElement).value);
  }

  setPage(page: number): void {
    this.page.set(page);
  }
}
