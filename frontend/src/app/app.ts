import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
})
export class App {}
