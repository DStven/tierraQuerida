import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
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

interface AuditoriaViewRow extends Auditoria {
  usuario_nombre?: string | null;
  modulo: string;
  fecha_label: string;
  hora_label: string;
  usuario_label: string;
}

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
                  <th class="px-4 py-3 font-medium">Módulo</th>
                  <th class="px-4 py-3 font-medium">Acción</th>
                  <th class="px-4 py-3 font-medium">Descripción</th>
                  <th class="px-4 py-3 font-medium">Usuario</th>
                  <th class="px-4 py-3 font-medium">Fecha</th>
                  <th class="px-4 py-3 font-medium">Hora</th>
                </tr>
              </thead>
              <tbody>
                @for (item of pageItems(); track item.id_auditoria) {
                  <tr>
                    <td class="px-4 py-3 text-zinc-400">{{ item.id_auditoria }}</td>
                    <td class="px-4 py-3 text-zinc-300">{{ item.modulo }}</td>
                    <td class="px-4 py-3 font-medium text-zinc-200">{{ item.accion }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ item.descripcion || '—' }}</td>
                    <td class="px-4 py-3 text-zinc-400">{{ item.usuario_label }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-zinc-400">{{ item.fecha_label }}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-zinc-400">{{ item.hora_label }}</td>
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
  private readonly destroyRef = inject(DestroyRef);

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

  readonly ordered = computed(() => [...this.auditorias()].sort((a, b) => {
    const aDate = this.parseDate(a.fecha).getTime();
    const bDate = this.parseDate(b.fecha).getTime();
    if (aDate !== bDate) {
      return bDate - aDate;
    }
    return Number(b.id_auditoria) - Number(a.id_auditoria);
  }));

  readonly viewRows = computed<AuditoriaViewRow[]>(() => this.ordered().map((item) => {
    const parsedDate = this.parseDate(item.fecha);
    const typedItem = item as Auditoria & { usuario_nombre?: string | null };
    return {
      ...item,
      modulo: this.extractModulo(item.accion),
      fecha_label: this.formatDate(parsedDate),
      hora_label: this.formatTime(parsedDate),
      usuario_label: typedItem.usuario_nombre || (item.id_usuario ? `Usuario #${item.id_usuario}` : 'Sistema'),
    };
  }));

  readonly filtered = computed(() =>
    filterBySearch(this.viewRows(), this.search(), ['accion', 'descripcion', 'modulo', 'usuario_label', 'fecha_label', 'hora_label']),
  );
  readonly pagination = computed(() => buildPagination(this.filtered().length, this.page(), this.pageSize));
  readonly pageItems = computed(() => paginate(this.filtered(), this.pagination().page, this.pageSize));

  constructor() {
    this.loadData();

    const refreshInterval = window.setInterval(() => {
      this.loadData(false);
    }, 30000);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(refreshInterval);
    });
  }

  loadData(withLoader = true): void {
    if (withLoader) {
      this.loading.set(true);
    }

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

  private extractModulo(accion: string): string {
    const normalized = String(accion || '').trim();
    if (!normalized) {
      return 'General';
    }

    const parts = normalized.split(/\s+/);
    if (parts.length < 2) {
      return normalized;
    }

    return parts.slice(1).join(' ');
  }

  private parseDate(value: string): Date {
    return new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  }

  private formatDate(value: Date): string {
    return value.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  private formatTime(value: Date): string {
    return value.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
}
