import { Component, input } from '@angular/core';
import { APP_ICONS } from '../constants/icon-names';
import { AppIconComponent } from './app-icon.component';

export type EmptyStateType =
  | 'default'
  | 'users'
  | 'suppliers'
  | 'categories'
  | 'products'
  | 'inventory'
  | 'movements'
  | 'audit'
  | 'search';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-16 text-center animate-[fadeIn_0.4s_ease]">
      <div class="mb-5 text-amber-500/50">
        <app-icon [icon]="iconName()" [size]="56" color="currentColor" [strokeWidth]="1.5" />
      </div>
      <h3 class="text-base font-semibold text-zinc-200">{{ title() }}</h3>
      <p class="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">{{ description() }}</p>
      @if (hint()) {
        <p class="mt-3 text-xs text-zinc-600">{{ hint() }}</p>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly type = input<EmptyStateType>('default');
  readonly title = input('Sin registros');
  readonly description = input('No hay datos para mostrar en este momento.');
  readonly hint = input<string | null>(null);

  iconName(): string {
    const icons: Record<EmptyStateType, string> = {
      default: 'layout-dashboard',
      users: APP_ICONS.usuarios,
      suppliers: APP_ICONS.proveedores,
      categories: APP_ICONS.categorias,
      products: APP_ICONS.productos,
      inventory: APP_ICONS.inventario,
      movements: APP_ICONS.movimientos,
      audit: APP_ICONS.auditoria,
      search: 'search',
    };
    return icons[this.type()] ?? icons.default;
  }
}
