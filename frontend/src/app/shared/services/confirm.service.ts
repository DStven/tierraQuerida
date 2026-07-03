import { Injectable, signal } from '@angular/core';

export type ConfirmType = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'warning',
        ...options,
        resolve,
      });
    });
  }

  accept(): void {
    const current = this.state();
    if (current) {
      current.resolve(true);
      this.state.set(null);
    }
  }

  cancel(): void {
    const current = this.state();
    if (current) {
      current.resolve(false);
      this.state.set(null);
    }
  }
}
