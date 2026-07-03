import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-3 p-4">
      @for (row of rowArray(); track row) {
        <div class="flex gap-4">
          @for (col of colArray(); track col) {
            <div
              class="h-4 rounded-md bg-white/[0.06]"
              [class.flex-[2]]="col === 0"
              [class.flex-1]="col !== 0"
            ></div>
          }
        </div>
      }
    </div>
  `,
})
export class SkeletonTableComponent {
  readonly rows = input(5);
  readonly cols = input(6);

  rowArray(): number[] {
    return Array.from({ length: this.rows() }, (_, i) => i);
  }

  colArray(): number[] {
    return Array.from({ length: this.cols() }, (_, i) => i);
  }
}
