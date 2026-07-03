import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-3 animate-[fadeIn_0.3s_ease]">
      @if (breadcrumbs().length) {
        <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
          @for (crumb of breadcrumbs(); track crumb.label; let last = $last) {
            @if (!last && crumb.path) {
              <a [routerLink]="crumb.path" class="transition hover:text-amber-400">{{ crumb.label }}</a>
              <span class="text-zinc-700" aria-hidden="true">/</span>
            } @else {
              <span [class.text-amber-400/90]="last" [class.font-medium]="last">{{ crumb.label }}</span>
              @if (!last) {
                <span class="text-zinc-700" aria-hidden="true">/</span>
              }
            }
          }
        </nav>
      }

      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight text-white">{{ title() }}</h2>
          @if (subtitle()) {
            <p class="mt-1 text-sm text-zinc-400">{{ subtitle() }}</p>
          }
          @if (totalCount() !== null) {
            <p class="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
              <span class="size-1.5 rounded-full bg-amber-400"></span>
              <span><strong class="font-semibold text-zinc-200">{{ totalCount() }}</strong> {{ totalCount() === 1 ? 'registro' : 'registros' }}</span>
              @if (filteredCount() !== null && filteredCount() !== totalCount()) {
                <span class="text-zinc-600">· {{ filteredCount() }} mostrados</span>
              }
            </p>
          }
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <ng-content select="[actions]" />
        </div>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly breadcrumbs = input<BreadcrumbItem[]>([]);
  readonly totalCount = input<number | null>(null);
  readonly filteredCount = input<number | null>(null);
}
