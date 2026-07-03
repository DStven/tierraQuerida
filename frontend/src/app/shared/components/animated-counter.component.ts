import { isPlatformBrowser } from '@angular/common';
import { Component, computed, effect, inject, input, OnDestroy, PLATFORM_ID, signal } from '@angular/core';

@Component({
  selector: 'app-animated-counter',
  standalone: true,
  template: `<span>{{ formatted() }}</span>`,
})
export class AnimatedCounterComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private animationFrameId = 0;

  readonly value = input<number | string>(0);
  readonly duration = input(600);
  readonly animate = input(true);

  private readonly display = signal<number | string>(0);

  readonly formatted = computed(() => {
    const current = this.display();
    return typeof current === 'number' ? current.toLocaleString('es-CO') : current;
  });

  constructor() {
    effect(() => {
      const nextValue = this.value();
      const animationEnabled = this.animate();
      const duration = this.duration();

      if (typeof nextValue === 'string' || !animationEnabled || !isPlatformBrowser(this.platformId)) {
        this.cancelAnimation();
        this.display.set(nextValue);
        return;
      }

      this.startAnimation(nextValue, duration);
    });
  }

  ngOnDestroy(): void {
    this.cancelAnimation();
  }

  private startAnimation(target: number, duration: number): void {
    this.cancelAnimation();

    const current = this.display();
    const start = typeof current === 'number' ? current : 0;
    const safeDuration = Math.max(0, duration);

    if (start === target || safeDuration === 0) {
      this.display.set(target);
      return;
    }

    const startTime = performance.now();

    const frame = (now: number): void => {
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / safeDuration, 1);
      const eased = this.easeOutCubic(progress);
      const currentValue = Math.round(start + (target - start) * eased);
      this.display.set(currentValue);

      if (progress >= 1) {
        this.display.set(target);
        this.animationFrameId = 0;
        return;
      }

      this.animationFrameId = requestAnimationFrame(frame);
    };

    this.animationFrameId = requestAnimationFrame(frame);
  }

  private cancelAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
}
