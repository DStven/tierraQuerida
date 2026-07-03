import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <span
      class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent"
      [class.size-4]="size() === 'sm'"
      [class.size-5]="size() === 'md'"
      [class.size-8]="size() === 'lg'"
      [class.border-zinc-950/30]="variant() === 'dark'"
      [class.border-t-zinc-950]="variant() === 'dark'"
      [class.border-amber-500/30]="variant() === 'amber'"
      [class.border-t-amber-400]="variant() === 'amber'"
      [class.border-white/30]="variant() === 'light'"
      [class.border-t-white]="variant() === 'light'"
      role="status"
      aria-label="Cargando"
    ></span>
  `,
})
export class SpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('sm');
  readonly variant = input<'dark' | 'amber' | 'light'>('dark');
}
