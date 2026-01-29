<script lang="ts">
    import { field_width, field_height, snap_value } from "../scripts/helpers";
    import {
        selected_target,
        snapping_enabled,
        targets,
        settings,
        type Target,
        multi_select_enabled,
        additional_selected_targets,
    } from "../scripts/store";

    var field_image: HTMLImageElement | undefined = $state();

    var pixels_to_meters: number = $state(0);
    var field_container_bounds: DOMRect = new DOMRect();
    var field_top: number = $state(0);
    var field_left: number = $state(0);

    var mouse_moved_before_mouseup = false;

    function get_field_dims() {
        field_container_bounds = field_image!.getBoundingClientRect();
        field_top =
            field_container_bounds.top -
            field_image!.parentElement!.getBoundingClientRect().top;
        field_left =
            field_container_bounds.left -
            field_image!.parentElement!.getBoundingClientRect().left;
        pixels_to_meters = field_width / field_container_bounds.width;
    }
    window.addEventListener("resize", get_field_dims);
    $effect(() => {
        get_field_dims();
    });

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

        if ($multi_select_enabled && $selected_target !== null) {
            $additional_selected_targets.push($selected_target);
        } else {
            additional_selected_targets.set([]);
        }

        const current_targets = $targets;
        const index = current_targets.push(new_target);
        targets.set(current_targets);
        selected_target.set(index - 1);
        console.log($targets, $selected_target);
    }

    function get_theta(e: PointerEvent, index: number): number {
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
        return new_theta;
    }

    function handle_rotate_target(e: PointerEvent, index: number) {
        const el = e.currentTarget as HTMLElement;
        if (!el.hasPointerCapture(e.pointerId)) {
            return;
        }

        const theta = get_theta(e, index);

        const current_targets = $targets;
        current_targets[index].reference.rotation = theta;
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

    function handle_rotate_target_entry_angle(e: PointerEvent, index: number) {
        const el = e.currentTarget as HTMLElement;
        if (!el.hasPointerCapture(e.pointerId)) {
            return;
        }

        const theta = get_theta(e, index);

        const current_targets = $targets;
        current_targets[index].entry_angle = theta;
        targets.set(current_targets);
    }
</script>

<div class="field-container" onmousedown={handle_click_on_field} role="none">
    {#each $targets.entries() as [index, target]}
        <div
            class={index === $selected_target
                ? "target_container selected"
                : "target_container"}
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
                {#if target.entry_angle !== undefined}
                    <div
                        class="entry_angle_container"
                        style="transform: rotateZ({-target.entry_angle}rad)"
                    >
                        <div
                            class="entry_angle_rotator exclude_tap"
                            onpointerdown={(e) => {
                                e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onpointermove={(e) =>
                                handle_rotate_target_entry_angle(e, index)}
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
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="24"
                                viewBox="0 0 12 24"
                                class="exclude_tap arrow"
                                ><path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"
                                /></svg
                            >
                        </div>
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
                        : $additional_selected_targets.includes(index)
                          ? "target_button additional_selected exclude_tap"
                          : "target_button  exclude_tap"}
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
                            if ($multi_select_enabled && $selected_target !== null) {
                                $additional_selected_targets.push(
                                    $selected_target,
                                );
                            } else {
                                additional_selected_targets.set([]);
                            }
                            selected_target.set(index);
                        }
                        mouse_moved_before_mouseup = false;
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="24"
                        viewBox="0 0 12 24"
                        class="exclude_tap"
                        ><path
                            fill="currentColor"
                            fill-rule="evenodd"
                            d="M10.157 12.711L4.5 18.368l-1.414-1.414l4.95-4.95l-4.95-4.95L4.5 5.64l5.657 5.657a1 1 0 0 1 0 1.414"
                        /></svg
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

    .target_container {
        left: 0;
        top: 0;
        position: absolute;

        contain: layout;
    }

    .target_container.selected {
        z-index: 1000;
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

        display: flex;
        align-items: center;
        justify-content: center;
    }
    .target_button > svg {
        pointer-events: none;
    }
    .target_button:active {
        cursor: grabbing;
    }
    .target_button:hover {
        border-color: #0ae;
    }
    .target_button.selected {
        border-color: #ea0;
    }
    .target_button.additional_selected {
        border-color: #a50;
    }

    .rotator {
        --size: 8px;

        width: var(--size);
        height: var(--size);

        position: absolute;
        right: calc(0% - 30px);
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

    .entry_angle_container {
        position: absolute;
        inset: 0;

        contain: layout;
    }
    .entry_angle_rotator {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;

        right: calc(0% - 60px);
        top: 50%;
        transform: translate(-50%, -50%) rotateZ(180deg);

        border-radius: 100%;

        z-index: 1000;
        cursor: grab;
    }
    .entry_angle_rotator:hover > .arrow {
        color: #0ae;
    }
    .entry_angle_rotator:active {
        cursor: grabbing;
    }
    .arrow {
        pointer-events: none;
        user-select: none;
        color: #fff;
    }
</style>
