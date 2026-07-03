import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { PaginationState } from '../utils/pagination.util';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
      <div class="flex flex-wrap items-center gap-3">
        <p>
          Mostrando
          <span class="font-medium text-zinc-200">{{ startItem() }}-{{ endItem() }}</span>
          de
          <span class="font-medium text-zinc-200">{{ state().totalItems }}</span>
          registros
        </p>
        @if (state().totalItems > 0) {
          <span class="hidden rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs sm:inline">
            Página {{ state().page }} de {{ state().totalPages }}
          </span>
        }
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          (click)="pageChange.emit(state().page - 1)"
          [disabled]="state().page <= 1"
          class="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <span class="px-2 text-xs sm:hidden">{{ state().page }}/{{ state().totalPages }}</span>
        <button
          type="button"
          (click)="pageChange.emit(state().page + 1)"
          [disabled]="state().page >= state().totalPages"
          class="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
})
export class PaginationComponent {
  readonly state = input.required<PaginationState>();
  readonly pageChange = output<number>();

  startItem(): number {
    const { page, pageSize, totalItems } = this.state();
    if (totalItems === 0) {
      return 0;
    }
    return (page - 1) * pageSize + 1;
  }

  endItem(): number {
    const { page, pageSize, totalItems } = this.state();
    return Math.min(page * pageSize, totalItems);
  }
}
