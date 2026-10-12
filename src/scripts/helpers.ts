export function snap_value(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export const field_width = 16.919575; //meters
export const field_height = 8.220075; //meters
