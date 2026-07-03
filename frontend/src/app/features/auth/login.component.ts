import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="relative min-h-dvh overflow-hidden bg-[#0c0a09] text-white">
      <!-- Background -->
      <div class="pointer-events-none absolute inset-0">
        <div class="absolute -left-32 top-0 size-[420px] rounded-full bg-amber-600/10 blur-3xl"></div>
        <div class="absolute bottom-0 right-0 size-[360px] rounded-full bg-orange-700/10 blur-3xl"></div>
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.08),transparent_55%)]"></div>
      </div>

      <div class="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:px-8">
        <!-- Brand panel -->
        <section class="hidden lg:block">
          <div class="inline-flex items-center gap-3 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-200">
            <span class="grid size-6 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">TQ</span>
            Tierra Querida
          </div>

          <h1 class="mt-8 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Inventario inteligente para tu
            <span class="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
              hamburguesería
            </span>
          </h1>

          <p class="mt-5 max-w-lg text-base leading-relaxed text-zinc-400">
            Controla materia prima, proveedores y movimientos de stock desde un panel seguro con autenticación JWT.
          </p>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <article class="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p class="text-2xl font-semibold text-amber-300">Stock</p>
              <p class="mt-1 text-xs text-zinc-500">Alertas de mínimo en tiempo real</p>
            </article>
            <article class="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p class="text-2xl font-semibold text-orange-300">Proveedores</p>
              <p class="mt-1 text-xs text-zinc-500">Entradas vinculadas a compras</p>
            </article>
            <article class="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p class="text-2xl font-semibold text-yellow-200">Roles</p>
              <p class="mt-1 text-xs text-zinc-500">Admin y empleado con permisos</p>
            </article>
          </div>
        </section>

        <!-- Login card -->
        <section class="mx-auto w-full max-w-md">
          <!-- Mobile brand -->
          <div class="mb-6 text-center lg:hidden">
            <div class="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-bold text-zinc-950 shadow-lg shadow-amber-900/30">
              TQ
            </div>
            <h2 class="mt-4 text-2xl font-semibold">Tierra Querida</h2>
            <p class="text-sm text-zinc-500">Gestión de inventario</p>
          </div>

          <form
            [formGroup]="form"
            (ngSubmit)="submit()"
            class="rounded-2xl border border-white/[0.08] bg-[#11100e]/90 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-8"
            novalidate
          >
            <div class="mb-6">
              <p class="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/80">Acceso seguro</p>
              <h3 class="mt-1 text-2xl font-semibold tracking-tight">Iniciar sesión</h3>
              <p class="mt-1 text-sm text-zinc-500">Ingresa tus credenciales para continuar</p>
            </div>

            @if (error()) {
              <div class="mb-5 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">
                <span class="mt-0.5 text-red-300" aria-hidden="true">!</span>
                <p>{{ error() }}</p>
              </div>
            }

            <!-- Email -->
            <div class="space-y-1.5">
              <label for="email" class="text-sm font-medium text-zinc-300">Email</label>
              <input
                id="email"
                type="email"
                autocomplete="email"
                formControlName="email"
                placeholder="usuario@tierraquerida.com"
                class="w-full rounded-xl border bg-zinc-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600"
                [class.border-red-500/50]="isInvalid('email')"
                [class.border-white/10]="!isInvalid('email')"
                [class.focus:border-amber-400]="!isInvalid('email')"
                [class.focus:ring-2]="!isInvalid('email')"
                [class.focus:ring-amber-400/20]="!isInvalid('email')"
              />
              @if (isInvalid('email')) {
                <p class="text-xs text-red-300">
                  @if (form.controls.email.errors?.['required']) {
                    El email es obligatorio.
                  } @else if (form.controls.email.errors?.['email']) {
                    Ingresa un email válido.
                  }
                </p>
              }
            </div>

            <!-- Contraseña -->
            <div class="mt-4 space-y-1.5">
              <label for="clave" class="text-sm font-medium text-zinc-300">Contraseña</label>
              <div class="relative">
                <input
                  id="clave"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  formControlName="clave"
                  placeholder="••••••••"
                  class="w-full rounded-xl border bg-zinc-950/80 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600"
                  [class.border-red-500/50]="isInvalid('clave')"
                  [class.border-white/10]="!isInvalid('clave')"
                  [class.focus:border-amber-400]="!isInvalid('clave')"
                  [class.focus:ring-2]="!isInvalid('clave')"
                  [class.focus:ring-amber-400/20]="!isInvalid('clave')"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-zinc-500 transition hover:text-zinc-300"
                  [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  {{ showPassword() ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
              @if (isInvalid('clave')) {
                <p class="text-xs text-red-300">
                  @if (form.controls.clave.errors?.['required']) {
                    La contraseña es obligatoria.
                  } @else if (form.controls.clave.errors?.['minlength']) {
                    Mínimo 4 caracteres.
                  }
                </p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/25 transition hover:from-amber-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              @if (loading()) {
                <span class="size-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950"></span>
                Verificando credenciales...
              } @else {
                Entrar al panel
              }
            </button>

            <p class="mt-5 text-center text-xs text-zinc-600">
              Autenticación JWT · Token almacenado de forma local
            </p>
          </form>
        </section>
      </div>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(4)]],
  });

  isInvalid(field: 'email' | 'clave'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.dirty || control.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Sesión iniciada correctamente');
        void this.router.navigate(['/dashboard']);
      },
      error: (err: { error?: { message?: string } }) => {
        const msg = err.error?.message ?? 'No fue posible iniciar sesión. Verifica tus credenciales.';
        this.error.set(msg);
        this.toast.error(msg);
        this.loading.set(false);
      },
    });
  }
}
