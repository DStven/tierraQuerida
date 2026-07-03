import { Component, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  template: `
    <svg
      [lucideIcon]="icon()"
      [size]="size()"
      [color]="color()"
      [strokeWidth]="strokeWidth()"
      [class]="className()"
    />
  `,
})
export class AppIconComponent {
  readonly icon = input.required<string>();
  readonly size = input<number | string>(28);
  readonly color = input<string>('#F59E0B');
  readonly strokeWidth = input<number>(1.75);
  readonly className = input<string>('');
}
