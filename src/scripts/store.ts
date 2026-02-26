import { writable, type Writable } from "svelte/store";
import type { ThemeSelection } from "./theme";

export interface Target {
  entry_angle?: number;
  ending_velocity?: number;
  turning_radius?: number;
  tolerance?: number;
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
  theme: ThemeSelection;
}

export const selected_target: Writable<number | null> = writable(0);
export const targets: Writable<Target[]> = writable([]);
export const additional_selected_targets: Writable<number[]> = writable([]);

export const snapping_enabled: Writable<boolean> = writable(false);
export const multi_select_enabled: Writable<boolean> = writable(false);

export const settings: Writable<Settings> = writable({
  robot_width: 0.5,
  robot_height: 0.5,
  theme: "Catppuccin Mocha",
});

export type ModalState = "hidden" | "edit_settings" | "confirm_clear" | "edit_name";
export const modal_state: Writable<ModalState> = writable("hidden");
