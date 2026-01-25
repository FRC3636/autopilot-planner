<script lang="ts">
    import { onMount } from "svelte";
    import { snap_value } from "../scripts/helpers";
    import {
        selected_target,
        snapping_enabled,
        targets,
        settings,
        type Target,
    } from "../scripts/store";
    var field_image: HTMLElement;

    const field_width = 16.54048; //meters
    const field_height = 8.06958; //meters
    var pixels_to_meters: number = 0;
    var field_container_bounds: DOMRect = new DOMRect();
    var field_top: number = 0;
    var field_left: number = 0;

    var mouse_moved_before_mouseup = false;

    function get_field_dims() {
        field_container_bounds = field_image.getBoundingClientRect();
        field_top =
            field_container_bounds.top -
            field_image.parentElement!.getBoundingClientRect().top;
        field_left =
            field_container_bounds.left -
            field_image.parentElement!.getBoundingClientRect().left;
        pixels_to_meters = field_width / field_container_bounds.width;
    }
    window.addEventListener("resize", get_field_dims);

    interface Position {
        x: number;
        y: number;
    }

    const clamp = (val: number, min: number, max: number) =>
        Math.max(min, Math.min(max, val));

    function pixels_to_real(coords: Position): Position {
        return {
            x: coords.x * pixels_to_meters,
            y: field_height - coords.y * pixels_to_meters,
        };
    }
    function pixels_to_real_clamped(coords: Position): Position {
        const real = pixels_to_real(coords);
        return {
            x: clamp(real.x, 0, field_width),
            y: clamp(real.y, 0, field_height),
        };
    }

    function real_to_pixels(coords: Position): Position {
        return {
            x: coords.x / pixels_to_meters,
            y: (field_height - coords.y) / pixels_to_meters,
        };
    }

    function field_relative_real_coords(coords: Position): Position {
        const relative_touch_coords = {
            x: coords.x - field_container_bounds.x,
            y: coords.y - field_container_bounds.y,
        };
        return pixels_to_real_clamped(relative_touch_coords);
    }

    function target_has_class(e: MouseEvent, class_name: string): boolean {
        if (e.target) {
            const elem = e.target as Element;
            if ((elem.getAttribute("class") || "").includes(class_name)) {
                return true;
            }
        }
        return false;
    }

    function handle_click_on_field(e: MouseEvent) {
        if (target_has_class(e, "exclude_tap")) {
            return;
        }
        if (e.button != 0) {
            return;
        }

        const real_coords = field_relative_real_coords({
            x: e.clientX,
            y: e.clientY,
        });

        const new_target: Target = {
            name: `Target ${$targets.length + 1}`,
            reference: {
                x: real_coords.x,
                y: real_coords.y,
                rotation: 0,
            },
        };

        const current_targets = $targets;
        const index = current_targets.push(new_target);
        targets.set(current_targets);
        selected_target.set(index - 1);
        console.log($targets, $selected_target);
    }

    function handle_rotate_target(e: PointerEvent, index: number) {
        const el = e.currentTarget as HTMLElement;
        if (!el.hasPointerCapture(e.pointerId)) {
            return;
        }

        const real_tap_coords = field_relative_real_coords({
            x: e.clientX,
            y: e.clientY,
        });
        const target_to_cursor = {
            x: real_tap_coords.x - $targets[index].reference.x,
            y: real_tap_coords.y - $targets[index].reference.y,
        };

        var new_theta = Math.atan2(target_to_cursor.y, target_to_cursor.x);
        if ($snapping_enabled) {
            new_theta = snap_value(new_theta, Math.PI / 8);
        }

        const current_targets = $targets;
        current_targets[index].reference.rotation = new_theta;
        targets.set(current_targets);
    }

    function handle_drag_target(e: PointerEvent, index: number) {
        const el = e.currentTarget as HTMLElement;
        if (!el.hasPointerCapture(e.pointerId)) {
            return;
        }
        if (index !== $selected_target) {
            selected_target.set(index);
        }

        mouse_moved_before_mouseup = true;

        var real_tap_coords = field_relative_real_coords({
            x: e.clientX,
            y: e.clientY,
        });
        if ($snapping_enabled) {
            real_tap_coords.x = snap_value(real_tap_coords.x, 0.1);
            real_tap_coords.y = snap_value(real_tap_coords.y, 0.1);
        }

        const current_targets = $targets;
        current_targets[index].reference.x = real_tap_coords.x;
        current_targets[index].reference.y = real_tap_coords.y;
        targets.set(current_targets);
    }

    function handle_drag_rotation_radius(e: PointerEvent, index: number) {
        const el = e.currentTarget as HTMLElement;
        if (!el.hasPointerCapture(e.pointerId)) {
            return;
        }

        const relative_touch_coords = {
            x: e.clientX - field_container_bounds.x,
            y: e.clientY - field_container_bounds.y,
        };
        const real_tap_coords = pixels_to_real(relative_touch_coords);
        const target_to_cursor = {
            x: real_tap_coords.x - $targets[index].reference.x,
            y: real_tap_coords.y - $targets[index].reference.y,
        };

        var new_radius = Math.hypot(target_to_cursor.x, target_to_cursor.y);
        if ($snapping_enabled) {
            new_radius = snap_value(new_radius, 0.25);
        }

        const current_targets = $targets;
        current_targets[index].turning_radius = new_radius;
        targets.set(current_targets);
    }
</script>

<div class="field-container" onmousedown={handle_click_on_field} role="none">
    {#each $targets.entries() as [index, target]}
        <div
            class="target-container"
            style="transform: translate(calc(-50% + {real_to_pixels(
                target.reference,
            ).x + field_left}px), calc(-50% + {real_to_pixels(target.reference)
                .y + field_top}px)); width: {$settings.robot_width /
                pixels_to_meters}px; height: {$settings.robot_height /
                pixels_to_meters}px;"
        >
            {#if index === $selected_target}
                {#if target.turning_radius !== undefined}
                    <div class="rotation_radius_ring_container">
                        <div
                            class="ring-visual"
                            style="width: {(target.turning_radius /
                                pixels_to_meters) *
                                2}px; height: {(target.turning_radius /
                                pixels_to_meters) *
                                2}px"
                        ></div>
                        <div
                            class="ring-hit exclude_tap"
                            onpointerdown={(e) => {
                                const rect =
                                    e.currentTarget.getBoundingClientRect();
                                const cx = rect.width / 2;
                                const cy = rect.height / 2;

                                const x = e.clientX - rect.left - cx;
                                const y = e.clientY - rect.top - cy;

                                const dist = Math.hypot(x, y);
                                const is_on_border =
                                    Math.abs(
                                        dist -
                                            target.turning_radius! /
                                                pixels_to_meters,
                                    ) < 12;
                                console.log(
                                    is_on_border,
                                    dist,
                                    target.turning_radius! / pixels_to_meters,
                                );
                                if (!is_on_border) return;

                                e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onpointermove={(e) =>
                                handle_drag_rotation_radius(e, index)}
                            onpointerup={(e) => {
                                e.currentTarget.releasePointerCapture(
                                    e.pointerId,
                                );
                            }}
                        ></div>
                    </div>
                {/if}
                {#if target.turning_radius !== undefined}
                    <div class="entry_angle_container">
                        <div class="entry_angle_rotator"></div>
                    </div>
                {/if}
            {/if}
            <div
                class="rotate_with_target"
                style="transform: rotateZ({-target.reference.rotation}rad)"
            >
                <button
                    class={index === $selected_target
                        ? "target_button selected exclude_tap"
                        : "target_button exclude_tap"}
                    onpointerdown={(e) => {
                        if (!target_has_class(e, "target_button")) {
                            return;
                        }
                        e.currentTarget.setPointerCapture(e.pointerId);
                    }}
                    onpointermove={(e) => handle_drag_target(e, index)}
                    onpointerup={(e) => {
                        if (
                            !target_has_class(e, "target_button") ||
                            !e.currentTarget.hasPointerCapture(e.pointerId)
                        ) {
                            return;
                        }

                        e.currentTarget.releasePointerCapture(e.pointerId);

                        if (index === $selected_target) {
                            if (!mouse_moved_before_mouseup) {
                                selected_target.set(null);
                            }
                        } else {
                            selected_target.set(index);
                        }
                        mouse_moved_before_mouseup = false;
                    }}
                >
                    {#if index === $selected_target}
                        <div
                            class="rotator exclude_tap"
                            role="none"
                            onpointerdown={(e) => {
                                e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onpointermove={(e) =>
                                handle_rotate_target(e, index)}
                            onpointerup={(e) => {
                                e.currentTarget.releasePointerCapture(
                                    e.pointerId,
                                );
                            }}
                            onpointercancel={(e) => {
                                e.currentTarget.releasePointerCapture(
                                    e.pointerId,
                                );
                            }}
                        ></div>
                    {/if}
                </button>
            </div>
        </div>
    {/each}
    <img
        src="/field.svg"
        bind:this={field_image}
        onload={() => get_field_dims()}
        class="field-image"
        alt="2026 Field"
    />
</div>

<style>
    button {
        all: unset;
    }

    .field-container {
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .field-image {
        width: 100%;
        pointer-events: none;
        user-select: none;
    }

    .target-container {
        left: 0;
        top: 0;
        position: absolute;

        contain: layout;
    }

    .rotate_with_target {
        width: 100%;
        height: 100%;
    }

    .target_button {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        border-radius: 5px;
        border: 2px solid #fff;
        cursor: grab;
    }
    .target_button:active {
        cursor: grabbing;
    }
    .target_button:hover {
        border-color: #0ae;
    }
    .target_button.selected {
        border-color: #ea0;
        z-index: 1000;
    }

    .rotator {
        --size: 8px;

        width: var(--size);
        height: var(--size);

        position: absolute;
        right: -100%;
        top: calc(50% - (var(--size) / 2));

        border-radius: 100%;
        background-color: #fff;
        z-index: 10;
        cursor: grab;
    }
    .rotator:hover {
        background-color: #0ae;
    }
    .rotator:active {
        cursor: grabbing;
    }

    .rotation_radius_ring_container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .ring-visual {
        border-radius: 50%;
        border: 2px solid #fff;
        /*background: repeating-linear-gradient(
            135deg,
            #0ae3 0px,
            #0ae3 5px,
            #0ae1 5px,
            #0ae1 10px
        );*/
        background-color: #0ae3;
        pointer-events: none;
    }
    .ring-hit {
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        pointer-events: auto;
    }
</style>
