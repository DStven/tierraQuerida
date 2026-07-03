import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnimatedCounterComponent } from './animated-counter.component';
import { AppIconComponent } from './app-icon.component';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [RouterLink, AppIconComponent, AnimatedCounterComponent],
  template: `
    <article
      class="stat-card group relative overflow-hidden p-4 sm:p-5"
      [style.animation-delay]="delay()"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        [class]="gradientClass()"
      ></div>
      <div class="absolute -right-4 -top-4 size-20 rounded-full opacity-[0.08] blur-2xl" [class]="accent()"></div>

      <div class="relative flex items-start justify-between gap-2.5 sm:gap-3">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">{{ label() }}</p>
          @if (loading()) {
            <div class="mt-3 h-9 w-20 animate-pulse rounded-md bg-white/[0.06]"></div>
          } @else {
            <p class="mt-2 text-2xl font-semibold leading-none tracking-tight text-white sm:text-[2rem]">
              <app-animated-counter [value]="value()" [animate]="!loading()" />
            </p>
          }
          <p class="mt-2 text-xs text-zinc-500">{{ hint() }}</p>
          @if (trend() !== null && !loading()) {
            <p
              class="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
              [class.bg-emerald-500/10]="trend()! >= 0"
              [class.text-emerald-300]="trend()! >= 0"
              [class.bg-red-500/10]="trend()! < 0"
              [class.text-red-300]="trend()! < 0"
            >
              {{ trend()! >= 0 ? '↑' : '↓' }} {{ trendLabel() }}
            </p>
          }
        </div>

        <div class="icon-badge shrink-0">
          <app-icon [icon]="icon()" [size]="22" color="#F59E0B" />
        </div>
      </div>

      @if (link()) {
        <a
          [routerLink]="link()!"
          class="relative mt-4 inline-flex items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-xs text-zinc-500 transition-all duration-200 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 group-hover:text-amber-300"
        >
          Ver detalle
          <app-icon icon="arrow-right" [size]="14" color="currentColor" className="opacity-70" />
        </a>
      }
    </article>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<number | string>(0);
  readonly hint = input('');
  readonly icon = input.required<string>();
  readonly accent = input('bg-amber-500');
  readonly gradientClass = input('from-amber-500/[0.06] via-transparent to-transparent');
  readonly link = input<string | undefined>(undefined);
  readonly loading = input(false);
  readonly trend = input<number | null>(null);
  readonly trendLabel = input('');
  readonly delay = input('0ms');
}
