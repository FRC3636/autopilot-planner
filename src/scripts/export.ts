import type { Target } from "./store";
import * as changeCase from "change-case";

export function export_targets_to_json(targets: Target[]): string {
  return JSON.stringify(targets);
}
export function import_targets_from_json(json: string): Target[] {
  return JSON.parse(json);
}

function target_to_ap(target: Target): string {
  const constructor = `APTarget()`;

  const reference = `Pose2d(${target.reference.x}.meters, ${target.reference.y}.meters, Rotation2d(${target.reference.rotation}.radians))`;

  var builders = [constructor, `withReference(${reference})`];

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
