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

export interface Settings {
  robot_width: number;
  robot_height: number;
}

export const selected_target: Writable<number | null> = writable(0);
export const targets: Writable<Target[]> = writable([]);

export const snapping_enabled: Writable<boolean> = writable(false);

export const settings: Writable<Settings> = writable({
  robot_width: 0.5,
  robot_height: 0.5,
});

export type ModalState = "hidden" | "edit_settings";
export const modal_state: Writable<ModalState> = writable("hidden");
