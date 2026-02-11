import { set } from "astro/zod";
import type { Settings, Target } from "./store";
import * as changeCase from "change-case";

export function export_state_to_json(
  targets: Target[],
  settings: Settings,
): string {
  return JSON.stringify({
    targets: targets,
    settings: settings,
  });
}
export function import_state_from_json(json: string): {
  targets: Target[];
  settings: Settings;
} {
  return JSON.parse(json);
}

function target_to_ap(target: Target): string {
  const reference = `Pose2d(${target.reference.x}.meters, ${target.reference.y}.meters, Rotation2d(${target.reference.rotation}.radians))`;

  const constructor = `APTarget(${reference})`;

  var builders = [constructor];

  if (target.ending_velocity !== undefined) {
    builders.push(`withVelocity(${target.ending_velocity})`);
  }
  if (target.entry_angle !== undefined) {
    builders.push(`withEntryAngle(Rotation2d(${target.entry_angle}.radians))`);
  }
  if (target.turning_radius !== undefined) {
    builders.push(`withTurningRadius(${target.turning_radius}.meters)`);
  }

  return builders.join(".");
}

export function export_targets_to_kotlin_enum(targets: Target[]): string {
  return `
enum class Targets(val target: APTarget) {
    ${targets.map((target) => `${changeCase.pascalCase(target.name, { mergeAmbiguousCharacters: true })}(${target_to_ap(target)})`).join(",\n    ")}
}
  `;
}

export function copy_kotlin_to_clipboard(targets: Target[]): void {
  navigator.clipboard.writeText(export_targets_to_kotlin_enum(targets));
}

export function download_json_save(targets: Target[], settings: Settings, file_name: string) {
  const blob = new Blob([export_state_to_json(targets, settings)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file_name;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
