import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:right-4 sm:left-auto">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur transition-all duration-300 animate-[slideIn_0.3s_ease-out] sm:min-w-[280px]"
          [class.border-emerald-500/30]="toast.type === 'success'"
          [class.bg-emerald-950/90]="toast.type === 'success'"
          [class.border-red-500/30]="toast.type === 'error'"
          [class.bg-red-950/90]="toast.type === 'error'"
          [class.border-amber-500/30]="toast.type === 'warning'"
          [class.bg-amber-950/90]="toast.type === 'warning'"
          [class.border-blue-500/30]="toast.type === 'info'"
          [class.bg-[#17120f]/95]="toast.type === 'info'"
        >
          <span
            class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            [class.bg-emerald-500/20]="toast.type === 'success'"
            [class.text-emerald-300]="toast.type === 'success'"
            [class.bg-red-500/20]="toast.type === 'error'"
            [class.text-red-300]="toast.type === 'error'"
            [class.bg-amber-500/20]="toast.type === 'warning'"
            [class.text-amber-300]="toast.type === 'warning'"
            [class.bg-blue-500/20]="toast.type === 'info'"
            [class.text-blue-300]="toast.type === 'info'"
          >
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else if (toast.type === 'warning') { ! }
            @else { i }
          </span>
          <p
            class="flex-1 text-sm"
            [class.text-emerald-100]="toast.type === 'success'"
            [class.text-red-100]="toast.type === 'error'"
            [class.text-amber-100]="toast.type === 'warning'"
            [class.text-zinc-200]="toast.type === 'info'"
          >
            {{ toast.message }}
          </p>
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 text-zinc-500 transition hover:text-zinc-300"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
