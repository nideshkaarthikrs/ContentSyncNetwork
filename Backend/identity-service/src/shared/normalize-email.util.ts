export function normalizeEmail(value: string): string {
  return value ? value.trim().toLowerCase() : value;
}
