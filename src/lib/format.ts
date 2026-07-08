export function formatHours(value: number): string {
  return `${value % 1 === 0 ? value : value.toFixed(1)}h`;
}
