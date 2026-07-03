export function debounce<T extends (...args: never[]) => void>(fn: T, delayMs: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delayMs);
  }) as T;
}
