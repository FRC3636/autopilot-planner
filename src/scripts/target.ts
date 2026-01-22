import { writable, type Writable } from "svelte/store";

export interface Target {
  entry_angle?: number;
  ending_velocity?: number;
  turning_radius?: number;
  pose: {
    x: number;
    y: number;
    rotation: number;
  };
}

const example_target: Target = {
  pose: {
    x: 0,
    y: 0,
    rotation: 0,
  },
};

export const selected_target: Writable<number | null> = writable(0);
export const targets: Writable<Target[]> = writable([example_target]);
