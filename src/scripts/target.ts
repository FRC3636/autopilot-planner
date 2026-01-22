import { writable, type Writable } from "svelte/store";

export interface Target {
  entry_angle?: number;
  ending_velocity?: number;
  turning_radius?: number;
  name: string;
  reference: {
    x: number;
    y: number;
    rotation: number;
  };
}

export const selected_target: Writable<number | null> = writable(0);
export const targets: Writable<Target[]> = writable([]);
