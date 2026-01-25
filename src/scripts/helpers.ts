export function snap_value(value: number, step: number): number {
  return Math.round(value / step) * step;
}
