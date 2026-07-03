export function filterBySearch<T extends object>(
  items: T[],
  search: string,
  fields: (keyof T)[],
): T[] {
  const term = search.trim().toLowerCase();
  if (!term) {
    return items;
  }

  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? '').toLowerCase().includes(term)),
  );
}
