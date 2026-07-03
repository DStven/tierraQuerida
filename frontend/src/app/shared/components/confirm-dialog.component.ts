import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (confirm.state(); as cfg) {
      <div class="modal-overlay" (click)="confirm.cancel()">
        <div
          class="modal-content max-w-md"
          (click)="$event.stopPropagation()"
          role="alertdialog"
          aria-modal="true"
        >
          <div class="flex items-start gap-4">
            <div
              class="grid size-11 shrink-0 place-items-center rounded-full"
              [class.bg-red-500/15]="cfg.type === 'danger'"
              [class.text-red-300]="cfg.type === 'danger'"
              [class.bg-amber-500/15]="cfg.type === 'warning'"
              [class.text-amber-300]="cfg.type === 'warning'"
              [class.bg-blue-500/15]="cfg.type === 'info'"
              [class.text-blue-300]="cfg.type === 'info'"
            >
              @if (cfg.type === 'danger') {
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              }
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white">{{ cfg.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-zinc-400">{{ cfg.message }}</p>
            </div>
          </div>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" (click)="confirm.cancel()" class="btn-secondary">{{ cfg.cancelText }}</button>
            <button
              type="button"
              (click)="confirm.accept()"
              class="btn-primary"
              [class.!bg-red-600]="cfg.type === 'danger'"
              [class.!text-white]="cfg.type === 'danger'"
              [class.hover:!bg-red-500]="cfg.type === 'danger'"
            >
              {{ cfg.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly confirm = inject(ConfirmService);
}
