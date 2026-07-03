import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { catchError, forkJoin, of } from 'rxjs';
import {
  Auditoria,
  Categoria,
  Inventario,
  MovimientoStock,
  Producto,
  Proveedor,
  UsuarioResponse,
} from '../../core/models/database.model';
import { AuthService } from '../../core/services/auth.service';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioService } from '../../core/services/inventario.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { APP_ICONS } from '../../shared/constants/icon-names';
import { AppIconComponent } from '../../shared/components/app-icon.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { SkeletonTableComponent } from '../../shared/components/skeleton-table.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { ToastService } from '../../shared/services/toast.service';

Chart.register(...registerables);

interface StatCardConfig {
  label: string;
  value: number | string;
  hint: string;
  icon: string;
  accent: string;
  gradientClass: string;
  link?: string;
  trend?: number | null;
  trendLabel?: string;
  delay: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    AppIconComponent,
    SkeletonTableComponent,
    SpinnerComponent,
    EmptyStateComponent,
  ],
  template: `
    <section class="dashboard-fade-in mx-auto max-w-7xl space-y-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <app-page-header
          title="Dashboard"
          subtitle="Resumen en tiempo real del inventario de materia prima"
          [breadcrumbs]="breadcrumbs"
        />

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs text-emerald-300">
            <span class="relative flex size-2">
              @if (loading() || refreshing()) {
                <span class="relative inline-flex size-2 rounded-full bg-amber-400 animate-pulse"></span>
              } @else {
                <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40"></span>
                <span class="relative inline-flex size-2 rounded-full bg-emerald-400"></span>
              }
            </span>
            {{ loading() || refreshing() ? 'Sincronizando...' : 'Datos actualizados' }}
          </div>

          @if (lastUpdated()) {
            <p class="text-xs text-zinc-500">
              Última actualización:
              <span class="font-medium text-zinc-400">{{ formatDate(lastUpdated()!) }}</span>
            </p>
          }

          <button
            type="button"
            (click)="refreshStats()"
            [disabled]="loading() || refreshing()"
            class="btn-secondary px-3 py-2 text-xs"
          >
            @if (refreshing()) {
              <app-spinner size="sm" variant="light" />
            } @else {
              <app-icon icon="refresh-cw" [size]="16" color="currentColor" />
            }
            Refrescar
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] py-8">
          <app-spinner size="md" variant="amber" />
          <p class="text-sm text-zinc-400">Cargando estadísticas del sistema...</p>
        </div>
      }

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" [class.opacity-60]="loading()">
        @for (card of statCards(); track card.label) {
          <app-stat-card
            [label]="card.label"
            [value]="card.value"
            [hint]="card.hint"
            [icon]="card.icon"
            [accent]="card.accent"
            [gradientClass]="card.gradientClass"
            [link]="card.link"
            [loading]="loading() || refreshing()"
            [trend]="card.trend ?? null"
            [trendLabel]="card.trendLabel ?? ''"
            [delay]="card.delay"
          />
        }
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="chart-card p-5" style="animation-delay: 80ms">
          <h3 class="text-sm font-semibold text-white">Estado del inventario</h3>
          <p class="text-xs text-zinc-500">Distribución por disponibilidad</p>
          @if (loading()) {
            <div class="mt-4 flex h-64 items-center justify-center">
              <app-spinner size="md" variant="amber" />
            </div>
          } @else {
            <div class="mt-4 flex justify-center">
              <div class="relative h-64 w-full max-w-xs">
                <canvas #statusChart></canvas>
              </div>
            </div>
          }
        </div>

        <div class="chart-card p-5" style="animation-delay: 120ms">
          <h3 class="text-sm font-semibold text-white">Productos por categoría</h3>
          <p class="text-xs text-zinc-500">Cantidad de ítems en inventario</p>
          @if (loading()) {
            <div class="mt-4 flex h-64 items-center justify-center">
              <app-spinner size="md" variant="amber" />
            </div>
          } @else {
            <div class="mt-4 h-64">
              <canvas #categoryChart></canvas>
            </div>
          }
        </div>

        <div class="chart-card p-5" style="animation-delay: 160ms">
          <h3 class="text-sm font-semibold text-white">Entradas vs Salidas</h3>
          <p class="text-xs text-zinc-500">Comparativa de movimientos totales</p>
          @if (loading()) {
            <div class="mt-4 flex h-64 items-center justify-center">
              <app-spinner size="md" variant="amber" />
            </div>
          } @else {
            <div class="mt-4 h-64">
              <canvas #flowChart></canvas>
            </div>
          }
        </div>

        <div class="chart-card p-5" style="animation-delay: 200ms">
          <h3 class="text-sm font-semibold text-white">Stock bajo</h3>
          <p class="text-xs text-zinc-500">Productos con alerta de inventario</p>
          @if (loading()) {
            <div class="mt-4 flex h-64 items-center justify-center">
              <app-spinner size="md" variant="amber" />
            </div>
          } @else if (lowStock().length === 0) {
            <div class="mt-4 flex h-64 items-center justify-center text-sm text-zinc-500">
              Sin alertas de stock bajo
            </div>
          } @else {
            <div class="mt-4 h-64">
              <canvas #lowStockChart></canvas>
            </div>
          }
        </div>

        @if (auth.isAdmin()) {
          <div class="chart-card p-5 lg:col-span-2" style="animation-delay: 240ms">
            <h3 class="text-sm font-semibold text-white">Movimientos — últimos 7 días</h3>
            <p class="text-xs text-zinc-500">Entradas y salidas registradas</p>
            @if (loading()) {
              <div class="mt-4 flex h-72 items-center justify-center">
                <app-spinner size="md" variant="amber" />
              </div>
            } @else {
              <div class="mt-4 h-72">
                <canvas #movementsChart></canvas>
              </div>
            }
          </div>
        }
      </div>

      <div class="grid gap-6 lg:grid-cols-5">
        <section class="card lg:col-span-3 overflow-hidden">
          <div class="card-header">
            <div>
              <h3 class="text-sm font-semibold text-white">Alertas de stock</h3>
              <p class="text-xs text-zinc-500">Productos con cantidad igual o por debajo del mínimo</p>
            </div>
            <span class="badge badge-warning">{{ lowStock().length }} alertas</span>
          </div>

          <div class="overflow-x-auto">
            @if (loading()) {
              <app-skeleton-table [rows]="3" [cols]="5" />
            } @else {
              <table class="table-modern w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr class="border-b border-white/[0.06]">
                    <th class="px-5 py-3 font-medium">Producto</th>
                    <th class="px-5 py-3 font-medium">Stock</th>
                    <th class="px-5 py-3 font-medium">Mínimo</th>
                    <th class="px-5 py-3 font-medium">Estado</th>
                    <th class="px-5 py-3 font-medium">Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of lowStock(); track item.id_inventario) {
                    <tr>
                      <td class="px-5 py-3.5 font-medium text-zinc-200">{{ item.producto }}</td>
                      <td class="px-5 py-3.5">
                        <span class="badge badge-warning">{{ item.cantidad }} unidades</span>
                      </td>
                      <td class="px-5 py-3.5 text-zinc-400">{{ item.stock_minimo }}</td>
                      <td class="px-5 py-3.5">
                        <span class="badge" [class.badge-success]="isDisponible(item.estado)" [class.badge-danger]="!isDisponible(item.estado)">
                          {{ formatEstado(item.estado) }}
                        </span>
                      </td>
                      <td class="px-5 py-3.5 text-zinc-400">{{ item.nombre_categoria }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5">
                        <app-empty-state
                          type="inventory"
                          title="Todo en orden"
                          description="No hay alertas de stock en este momento."
                        />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </section>

        <aside class="flex flex-col gap-4 lg:col-span-2">
          <div class="card p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-zinc-500">Accesos rápidos</p>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <a routerLink="/inventario" class="rounded-lg border border-white/[0.08] px-3 py-2.5 text-center text-xs text-zinc-300 transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-200">Inventario</a>
              <a routerLink="/movimientos" class="rounded-lg border border-white/[0.08] px-3 py-2.5 text-center text-xs text-zinc-300 transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-200">Movimientos</a>
              <a routerLink="/proveedores" class="rounded-lg border border-white/[0.08] px-3 py-2.5 text-center text-xs text-zinc-300 transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-200">Proveedores</a>
              <a routerLink="/categorias" class="rounded-lg border border-white/[0.08] px-3 py-2.5 text-center text-xs text-zinc-300 transition hover:border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-200">Categorías</a>
            </div>
          </div>
        </aside>
      </div>

      @if (auth.isAdmin()) {
        <section class="card overflow-hidden">
          <div class="card-header">
            <div>
              <h3 class="text-sm font-semibold text-white">Últimas auditorías</h3>
              <p class="text-xs text-zinc-500">Cambios recientes registrados en el sistema</p>
            </div>
          </div>
          <div class="overflow-x-auto">
            @if (loading()) {
              <app-skeleton-table [rows]="4" [cols]="4" />
            } @else {
              <table class="table-modern w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr class="border-b border-white/[0.06]">
                    <th class="px-5 py-3 font-medium">Fecha</th>
                    <th class="px-5 py-3 font-medium">Acción</th>
                    <th class="px-5 py-3 font-medium">Descripción</th>
                    <th class="px-5 py-3 font-medium">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  @for (audit of recentAudits(); track audit.id_auditoria) {
                    <tr>
                      <td class="px-5 py-3.5 whitespace-nowrap text-zinc-400">{{ formatDate(audit.fecha) }}</td>
                      <td class="px-5 py-3.5 font-medium text-zinc-200">{{ audit.accion }}</td>
                      <td class="px-5 py-3.5 text-zinc-400">{{ audit.descripcion || '—' }}</td>
                      <td class="px-5 py-3.5 text-zinc-400">{{ audit.id_usuario ?? 'Sistema' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4">
                        <app-empty-state type="audit" title="Sin auditorías recientes" description="Aún no hay registros de auditoría para mostrar." />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </section>
      }

      <section class="card overflow-hidden">
        <div class="card-header">
          <div>
            <h3 class="text-sm font-semibold text-white">Últimos movimientos de inventario</h3>
            <p class="text-xs text-zinc-500">Entradas y salidas registradas recientemente</p>
          </div>
          @if (auth.isAdmin()) {
            <a routerLink="/movimientos" class="btn-secondary text-xs">Ver todos</a>
          }
        </div>

        @if (!auth.isAdmin()) {
          <div class="px-5 py-12 text-center">
            <p class="text-sm text-zinc-500">El historial completo requiere rol Administrador</p>
            <a routerLink="/movimientos" class="mt-3 inline-block text-xs text-amber-300 hover:underline">Registrar movimiento</a>
          </div>
        } @else {
          <div class="overflow-x-auto">
            @if (loading()) {
              <app-skeleton-table [rows]="4" [cols]="6" />
            } @else {
              <table class="table-modern w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr class="border-b border-white/[0.06]">
                    <th class="px-5 py-3 font-medium">Fecha</th>
                    <th class="px-5 py-3 font-medium">Producto</th>
                    <th class="px-5 py-3 font-medium">Tipo</th>
                    <th class="px-5 py-3 font-medium">Cantidad</th>
                    <th class="px-5 py-3 font-medium">Usuario</th>
                    <th class="px-5 py-3 font-medium">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (mov of recentMovements(); track mov.id_movimiento) {
                    <tr>
                      <td class="px-5 py-3.5 whitespace-nowrap text-zinc-400">{{ formatDate(mov.fecha_movimiento) }}</td>
                      <td class="px-5 py-3.5 font-medium text-zinc-200">{{ productName(mov.id_inventario) }}</td>
                      <td class="px-5 py-3.5">
                        <span class="badge" [class.badge-success]="mov.tipo_movimiento === 'Entrada'" [class.badge-danger]="mov.tipo_movimiento === 'Salida'">
                          {{ mov.tipo_movimiento }}
                        </span>
                      </td>
                      <td class="px-5 py-3.5 text-zinc-300">{{ mov.cantidad }}</td>
                      <td class="px-5 py-3.5 text-zinc-400">{{ userName(mov.id_usuario) }}</td>
                      <td class="max-w-[200px] truncate px-5 py-3.5 text-zinc-500">{{ mov.observacion || '—' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6">
                        <app-empty-state type="movements" title="Sin movimientos" description="Aún no hay movimientos registrados en el inventario." />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        }
      </section>
    </section>
  `,
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toast = inject(ToastService);
  private readonly inventarioService = inject(InventarioService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly productoService = inject(ProductoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly auditoriaService = inject(AuditoriaService);

  readonly statusChartRef = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');
  readonly categoryChartRef = viewChild<ElementRef<HTMLCanvasElement>>('categoryChart');
  readonly flowChartRef = viewChild<ElementRef<HTMLCanvasElement>>('flowChart');
  readonly lowStockChartRef = viewChild<ElementRef<HTMLCanvasElement>>('lowStockChart');
  readonly movementsChartRef = viewChild<ElementRef<HTMLCanvasElement>>('movementsChart');

  private charts: Chart[] = [];

  readonly inventario = signal<Inventario[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly movimientos = signal<MovimientoStock[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly auditorias = signal<Auditoria[]>([]);
  readonly lowStock = signal<Inventario[]>([]);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly lastUpdated = signal<string | null>(null);
  readonly breadcrumbs = [{ label: 'Inicio', path: '/dashboard' }, { label: 'Dashboard' }];

  readonly recentMovements = computed(() => this.movimientos().slice(0, 10));
  readonly recentAudits = computed(() => this.auditorias().slice(0, 6));

  readonly movimientosHoy = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.movimientos().filter((m) => {
      const date = new Date(m.fecha_movimiento.includes('T') ? m.fecha_movimiento : m.fecha_movimiento.replace(' ', 'T'));
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime();
    }).length;
  });

  readonly totalEntradas = computed(() => this.movimientos()
    .filter((m) => m.tipo_movimiento === 'Entrada')
    .reduce((sum, m) => sum + this.toNumber(m.cantidad), 0));
  readonly totalSalidas = computed(() => this.movimientos()
    .filter((m) => m.tipo_movimiento === 'Salida')
    .reduce((sum, m) => sum + this.toNumber(m.cantidad), 0));

  readonly disponiblesCount = computed(() =>
    this.inventario().filter((item) => this.isDisponible(item.estado)).length,
  );

  readonly totalProductos = computed(() => this.inventario().length);
  readonly productosConStock = computed(() => this.inventario().filter((item) => this.toNumber(item.cantidad) > 0).length);
  readonly productosStockBajo = computed(() => this.inventario().filter((item) => {
    const cantidad = this.toNumber(item.cantidad);
    const minimo = this.toNumber(item.stock_minimo);
    return cantidad > 0 && cantidad <= minimo;
  }).length);
  readonly productosAgotados = computed(() => this.inventario().filter((item) => this.toNumber(item.cantidad) === 0).length);
  readonly stockTotal = computed(() => this.inventario().reduce((sum, item) => sum + this.toNumber(item.cantidad), 0));

  readonly statCards = computed((): StatCardConfig[] => [
    {
      label: 'Productos registrados',
      value: this.totalProductos(),
      hint: 'En el catálogo',
      icon: APP_ICONS.productos,
      accent: 'bg-amber-500',
      gradientClass: 'from-amber-500/[0.08] via-transparent to-transparent',
      link: '/inventario',
      trend: null,
      delay: '0ms',
    },
    {
      label: 'Entradas',
      value: this.totalEntradas(),
      hint: 'Movimientos de entrada',
      icon: APP_ICONS.movimientos,
      accent: 'bg-emerald-500',
      gradientClass: 'from-emerald-500/[0.08] via-transparent to-transparent',
      link: '/movimientos',
      trend: this.totalEntradas() ? this.totalEntradas() : null,
      trendLabel: 'entradas',
      delay: '120ms',
    },
    {
      label: 'Salidas',
      value: this.totalSalidas(),
      hint: 'Movimientos de salida',
      icon: APP_ICONS.movimientos,
      accent: 'bg-red-500',
      gradientClass: 'from-red-500/[0.08] via-transparent to-transparent',
      link: '/movimientos',
      trend: this.totalSalidas() ? -this.totalSalidas() : null,
      trendLabel: 'salidas',
      delay: '160ms',
    },
    {
      label: 'Alertas de inventario',
      value: this.lowStock().length,
      hint: 'Stock bajo detectado',
      icon: APP_ICONS.alertas,
      accent: 'bg-yellow-500',
      gradientClass: 'from-yellow-500/[0.08] via-transparent to-transparent',
      link: '/inventario',
      trend: this.lowStock().length ? -this.lowStock().length : null,
      trendLabel: 'alertas',
      delay: '200ms',
    },
  ]);

  constructor() {
    this.loadData(true);
  }

  ngAfterViewInit(): void {
    if (!this.loading()) {
      this.renderCharts();
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  refreshStats(): void {
    this.loadData(false);
  }

  private loadData(initial: boolean): void {
    if (initial) {
      this.loading.set(true);
    } else {
      this.refreshing.set(true);
    }

    forkJoin({
      inventario: this.inventarioService.list().pipe(catchError(() => of([] as Inventario[]))),
      proveedores: this.proveedorService.list().pipe(catchError(() => of([] as Proveedor[]))),
      productos: this.productoService.list().pipe(catchError(() => of([] as Producto[]))),
      categorias: this.categoriaService.list().pipe(catchError(() => of([] as Categoria[]))),
      usuarios: this.auth.isAdmin()
        ? this.usuarioService.list().pipe(catchError(() => of([] as UsuarioResponse[])))
        : of([] as UsuarioResponse[]),
      movimientos: this.auth.isAdmin()
        ? this.movimientoService.list().pipe(catchError(() => of([] as MovimientoStock[])))
        : of([] as MovimientoStock[]),
      auditorias: this.auth.isAdmin()
        ? this.auditoriaService.list().pipe(catchError(() => of([] as Auditoria[])))
        : of([] as Auditoria[]),
    }).subscribe({
      next: ({ inventario, proveedores, productos, usuarios, movimientos, categorias, auditorias }) => {
        this.inventario.set(inventario);
        this.proveedores.set(proveedores);
        this.productos.set(productos);
        this.usuarios.set(usuarios);
        this.movimientos.set(movimientos);
        this.categorias.set(categorias);
        this.auditorias.set(auditorias);
        // Filtrar productos con stock bajo (cantidad > 0 AND cantidad < stock_minimo)
        this.lowStock.set(inventario.filter((item: Inventario) => {
          const cantidad = this.toNumber(item.cantidad);
          const minimo = this.toNumber(item.stock_minimo);
          return cantidad > 0 && cantidad <= minimo;
        }));
        this.lastUpdated.set(new Date().toISOString());
        this.loading.set(false);
        this.refreshing.set(false);
        requestAnimationFrame(() => this.renderCharts());
        if (!initial) {
          this.toast.success('Estadísticas actualizadas correctamente');
        }
      },
      error: () => {
        this.loading.set(false);
        this.refreshing.set(false);
        this.toast.error('No fue posible actualizar las estadísticas');
      },
    });
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private renderCharts(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.destroyCharts();

    const chartDefaults = {
      color: '#a1a1aa',
      borderColor: 'rgba(255,255,255,0.08)',
    };

    const statusCanvas = this.statusChartRef()?.nativeElement;
    if (statusCanvas) {
      const lowStockIds = new Set(this.lowStock().map((i) => i.id_inventario));
      const disponibles = this.inventario().filter(
        (item) => this.isDisponible(item.estado) && !lowStockIds.has(item.id_inventario),
      ).length;
      const low = this.lowStock().length;
      const agotados = this.inventario().filter((item) => !this.isDisponible(item.estado)).length;

      const config: ChartConfiguration = {
        type: 'doughnut',
        data: {
          labels: ['Disponibles', 'Stock bajo', 'Agotados'],
          datasets: [{
            data: [disponibles, low, Math.max(agotados, 0)],
            backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
            borderWidth: 0,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: chartDefaults.color, padding: 16, usePointStyle: true },
            },
          },
        },
      };
      this.charts.push(new Chart(statusCanvas, config));
    }

    const categoryCanvas = this.categoryChartRef()?.nativeElement;
    if (categoryCanvas) {
      const counts = this.categorias().map((cat) => ({
        name: cat.nombre_categoria,
        count: this.inventario().filter((i) => Number(i.id_categoria) === Number(cat.id_categoria)).length,
      }));

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: counts.map((c) => c.name),
          datasets: [{
            label: 'Productos',
            data: counts.map((c) => c.count),
            backgroundColor: 'rgba(245,158,11,0.75)',
            borderRadius: 6,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: chartDefaults.color } },
            y: { beginAtZero: true, grid: { color: chartDefaults.borderColor }, ticks: { color: chartDefaults.color, stepSize: 1 } },
          },
        },
      };
      this.charts.push(new Chart(categoryCanvas, config));
    }

    const flowCanvas = this.flowChartRef()?.nativeElement;
    if (flowCanvas) {
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: ['Entradas', 'Salidas'],
          datasets: [{
            label: 'Movimientos',
            data: [this.totalEntradas(), this.totalSalidas()],
            backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: chartDefaults.color } },
            y: { beginAtZero: true, grid: { color: chartDefaults.borderColor }, ticks: { color: chartDefaults.color, stepSize: 1 } },
          },
        },
      };
      this.charts.push(new Chart(flowCanvas, config));
    }

    const lowStockCanvas = this.lowStockChartRef()?.nativeElement;
    if (lowStockCanvas && this.lowStock().length > 0) {
      const items = this.lowStock().slice(0, 8);
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: items.map((i) => i.producto),
          datasets: [{
            label: 'Stock actual',
            data: items.map((i) => Number(i.cantidad)),
            backgroundColor: 'rgba(245,158,11,0.75)',
            borderRadius: 6,
          }, {
            label: 'Stock mínimo',
            data: items.map((i) => this.toNumber(i.stock_minimo)),
            backgroundColor: 'rgba(239,68,68,0.55)',
            borderRadius: 6,
          }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: chartDefaults.color, usePointStyle: true },
            },
          },
          scales: {
            x: { beginAtZero: true, grid: { color: chartDefaults.borderColor }, ticks: { color: chartDefaults.color } },
            y: { grid: { display: false }, ticks: { color: chartDefaults.color } },
          },
        },
      };
      this.charts.push(new Chart(lowStockCanvas, config));
    }

    const movementsCanvas = this.movementsChartRef()?.nativeElement;
    if (movementsCanvas && this.auth.isAdmin()) {
      const days = this.last7Days();
      const entradas = days.map((d) => this.countMovements(d, 'Entrada'));
      const salidas = days.map((d) => this.countMovements(d, 'Salida'));

      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: days.map((d) => d.label),
          datasets: [
            {
              label: 'Entradas',
              data: entradas,
              borderColor: 'rgb(16,185,129)',
              backgroundColor: 'rgba(16,185,129,0.12)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Salidas',
              data: salidas,
              borderColor: 'rgb(239,68,68)',
              backgroundColor: 'rgba(239,68,68,0.12)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: chartDefaults.color, usePointStyle: true } },
          },
          scales: {
            x: { grid: { color: chartDefaults.borderColor }, ticks: { color: chartDefaults.color } },
            y: { beginAtZero: true, grid: { color: chartDefaults.borderColor }, ticks: { color: chartDefaults.color, stepSize: 1 } },
          },
        },
      };
      this.charts.push(new Chart(movementsCanvas, config));
    }
  }

  private last7Days(): { date: Date; label: string }[] {
    const days: { date: Date; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      days.push({
        date: d,
        label: new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric' }).format(d),
      });
    }
    return days;
  }

  private countMovements(day: { date: Date }, tipo: 'Entrada' | 'Salida'): number {
    return this.movimientos().filter((m) => {
      if (m.tipo_movimiento !== tipo) {
        return false;
      }
      const date = new Date(m.fecha_movimiento.includes('T') ? m.fecha_movimiento : m.fecha_movimiento.replace(' ', 'T'));
      date.setHours(0, 0, 0, 0);
      return date.getTime() === day.date.getTime();
    }).length;
  }

  private toNumber(value: unknown): number {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  categoryName(id: number): string {
    return this.categorias().find((c) => Number(c.id_categoria) === Number(id))?.nombre_categoria ?? `Categoría ${id}`;
  }

  productName(id: number): string {
    return this.inventario().find((item) => Number(item.id_inventario) === Number(id))?.producto ?? `Producto ${id}`;
  }

  userName(id: number): string {
    return this.usuarios().find((u) => Number(u.id_usuario) === Number(id))?.nombre ?? `Usuario ${id}`;
  }

  isDisponible(estado: Inventario['estado']): boolean {
    return estado === 'Disponible' || estado === 1 || estado === true || String(estado).toLowerCase() === 'disponible';
  }

  formatEstado(estado: Inventario['estado']): string {
    return this.isDisponible(estado) ? 'Disponible' : 'Agotado';
  }

  formatDate(value: string): string {
    if (!value) {
      return '—';
    }
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
