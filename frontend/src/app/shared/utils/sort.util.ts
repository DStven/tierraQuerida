export type SortDirection = 'asc' | 'desc';

export function sortItems<T>(
  items: T[],
  field: keyof T | null,
  direction: SortDirection,
): T[] {
  if (!field) {
    return items;
  }

  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    const aStr = String(aVal ?? '').toLowerCase();
    const bStr = String(bVal ?? '').toLowerCase();

    if (aStr < bStr) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aStr > bStr) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function toggleSort(
  currentField: string | null,
  currentDirection: SortDirection,
  field: string,
): { field: string; direction: SortDirection } {
  if (currentField === field) {
    return { field, direction: currentDirection === 'asc' ? 'desc' : 'asc' };
  }
  return { field, direction: 'asc' };
}
