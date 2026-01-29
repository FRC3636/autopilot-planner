export function snap_value(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export const field_width = 16.54048; //meters
export const field_height = 8.06958; //meters
