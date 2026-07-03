import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { APP_ICONS } from '../shared/constants/icon-names';
import { AppIconComponent } from '../shared/components/app-icon.component';
import { ConfirmService } from '../shared/services/confirm.service';
import { getInitials } from '../shared/utils/string.util';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    <div class="min-h-dvh bg-[#11100e] text-zinc-100">
      <aside
        [class.w-[4.5rem]]="collapsed()"
        [class.w-64]="!collapsed()"
        class="fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#17120f] shadow-xl transition-all duration-300 ease-in-out md:block"
      >
        <div class="flex h-16 items-center justify-between border-b border-white/[0.06] px-3">
          @if (!collapsed()) {
            <div class="overflow-hidden pl-1">
              <p class="truncate text-sm font-bold text-amber-300">Tierra Querida</p>
              <p class="truncate text-[11px] text-zinc-500">Inventario</p>
            </div>
          }
          <button
            type="button"
            (click)="collapsed.set(!collapsed())"
            class="ml-auto grid size-8 place-items-center rounded-lg border border-white/10 text-zinc-400 transition duration-200 hover:border-amber-500/30 hover:bg-white/5 hover:text-amber-300"
            [attr.aria-label]="collapsed() ? 'Expandir menú' : 'Contraer menú'"
          >
            <span class="inline-flex transition-transform duration-300" [class.rotate-180]="collapsed()">
              <app-icon icon="chevron-left" [size]="16" color="currentColor" />
            </span>
          </button>
        </div>

        <nav class="space-y-1 px-2 py-4">
          @for (item of visibleNav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
              class="nav-link group relative flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition-all duration-200 hover:bg-white/[0.04] hover:text-zinc-200"
              [attr.data-tooltip]="collapsed() ? item.label : null"
            >
              <span class="icon-badge !size-8 [&_svg]:!size-[18px]">
                <app-icon [icon]="item.icon" [size]="18" color="#F59E0B" />
              </span>
              @if (!collapsed()) {
                <span class="truncate font-medium">{{ item.label }}</span>
              }
            </a>
          }
        </nav>
      </aside>

      <div
        [class.md:pl-[4.5rem]]="collapsed()"
        [class.md:pl-64]="!collapsed()"
        class="transition-all duration-300 ease-in-out"
      >
        <header class="sticky top-0 z-20 border-b border-white/10 bg-[#11100e]/95 backdrop-blur-md">
          <div class="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div>
              <h1 class="text-base font-semibold tracking-tight text-white sm:text-lg">
                Sistema de Gestión de Inventario
              </h1>
              <p class="text-xs text-zinc-500 sm:text-sm">Panel Administrativo</p>
            </div>

            <div class="relative flex items-center gap-3 sm:gap-4">
              <div class="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 sm:flex">
                <span class="relative flex size-2">
                  <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40"></span>
                  <span class="relative inline-flex size-2 rounded-full bg-emerald-400"></span>
                </span>
                <span class="text-xs font-medium text-emerald-300">En línea</span>
              </div>

              <button
                type="button"
                (click)="toggleUserMenu()"
                class="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition duration-200 hover:border-white/10 hover:bg-white/[0.03]"
                [attr.aria-expanded]="userMenuOpen()"
                aria-haspopup="true"
              >
                <div class="hidden text-right sm:block">
                  <p class="text-sm font-medium text-zinc-100">{{ userName() }}</p>
                  <p class="text-xs text-amber-400/80">{{ auth.currentRole() ?? 'Usuario' }}</p>
                </div>
                <div
                  class="avatar avatar-md avatar-amber shadow-lg shadow-amber-500/20"
                  [title]="userName()"
                >
                  {{ userInitials() }}
                </div>
              </button>

              @if (userMenuOpen()) {
                <div
                  class="user-menu-panel absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#17120f] shadow-2xl"
                >
                  <div class="border-b border-white/[0.06] px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div class="avatar avatar-md avatar-amber">{{ userInitials() }}</div>
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-white">{{ userName() }}</p>
                        <p class="truncate text-xs text-amber-400/80">{{ auth.currentRole() ?? 'Usuario' }}</p>
                        <p class="mt-1 inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
                          <span class="size-1.5 rounded-full bg-emerald-400"></span>
                          En línea
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="p-2">
                    <button
                      type="button"
                      (click)="logout()"
                      class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-300 transition hover:bg-red-500/10 hover:text-red-200"
                    >
                      <app-icon icon="log-out" [size]="16" color="currentColor" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </header>

        <nav class="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 md:hidden">
          @for (item of visibleNav(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
              [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
              class="whitespace-nowrap rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition duration-200"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <main class="page-enter p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly confirm = inject(ConfirmService);
  private readonly document = inject(DOCUMENT);
  readonly collapsed = signal(false);
  readonly userMenuOpen = signal(false);

  readonly userName = computed(() => this.auth.currentUser()?.nombre ?? 'Usuario');
  readonly userInitials = computed(() => getInitials(this.userName()));

  private readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: APP_ICONS.dashboard },
    { label: 'Usuarios', path: '/usuarios', icon: APP_ICONS.usuarios, roles: ['Administrador'] },
    { label: 'Proveedores', path: '/proveedores', icon: APP_ICONS.proveedores },
    { label: 'Categorías', path: '/categorias', icon: APP_ICONS.categorias },
    { label: 'Productos', path: '/productos', icon: APP_ICONS.productos, roles: ['Administrador'] },
    { label: 'Inventario', path: '/inventario', icon: APP_ICONS.inventario },
    { label: 'Movimientos', path: '/movimientos', icon: APP_ICONS.movimientos },
    { label: 'Auditoría', path: '/auditoria', icon: APP_ICONS.auditoria, roles: ['Administrador'] },
  ];

  readonly visibleNav = computed(() => {
    const role = this.auth.currentRole();
    return this.nav.filter((item) => !item.roles?.length || (role && item.roles.includes(role)));
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated() && !this.auth.currentRole()) {
      this.auth.perfil().subscribe();
    }

    this.document.addEventListener('click', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('click', this.onDocumentClick);
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  private onDocumentClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[aria-haspopup="true"]') && !target?.closest('.user-menu-panel')) {
      this.userMenuOpen.set(false);
    }
  };

  logout(): void {
    this.userMenuOpen.set(false);
    void this.confirm
      .confirm({
        title: 'Cerrar sesión',
        message: '¿Está seguro que desea cerrar su sesión? Deberá volver a iniciar sesión para acceder al sistema.',
        confirmText: 'Cerrar sesión',
        cancelText: 'Cancelar',
        type: 'warning',
      })
      .then((confirmed) => {
        if (confirmed) {
          this.auth.logout();
        }
      });
  }
}
