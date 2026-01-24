<script lang="ts">
    import { selected_target, targets, type Target } from "../scripts/target";

    var field_image: HTMLElement;

    const field_width = 16.54048; //meters
    const field_height = 8.06958; //meters
    var pixels_to_meters: number = 0;
    var field_container_bounds: DOMRect = new DOMRect();

    var mouse_moved_before_mouseup = false;

    interface Position {
        x: number;
        y: number;
    }

    function pixels_to_real(coords: Position): Position {
        return {
            x: coords.x * pixels_to_meters,
            y: field_height - coords.y * pixels_to_meters,
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
        return pixels_to_real(relative_touch_coords);
    }

    function radians_to_degrees(radians: number): number {
        return radians * (180 / Math.PI);
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

        field_container_bounds = field_image.getBoundingClientRect();
        pixels_to_meters = field_width / field_container_bounds.width;

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

        const new_theta = Math.atan2(target_to_cursor.y, target_to_cursor.x);

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

        const real_tap_coords = field_relative_real_coords({
            x: e.clientX,
            y: e.clientY,
        });

        const current_targets = $targets;
        current_targets[index].reference.x = real_tap_coords.x;
        current_targets[index].reference.y = real_tap_coords.y;
        targets.set(current_targets);
    }
</script>

<div class="field-container" onmousedown={handle_click_on_field} role="none">
    {#each $targets.entries() as [index, target]}
        <button
            class={index === $selected_target
                ? "target selected exclude_tap"
                : "target exclude_tap"}
            style={`transform: translate(
              ${real_to_pixels(target.reference).x - 25 / 2}px,
              ${real_to_pixels(target.reference).y + field_container_bounds.y - 25}px
            ) rotateZ(${-target.reference.rotation}rad)`}
            onpointerdown={(e) => {
                if (!target_has_class(e, "target")) {
                    return;
                }
                e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onpointermove={(e) => handle_drag_target(e, index)}
            onpointerup={(e) => {
                if (
                    !target_has_class(e, "target") ||
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
                    onpointermove={(e) => handle_rotate_target(e, index)}
                    onpointerup={(e) => {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                    }}
                    onpointercancel={(e) => {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                    }}
                ></div>
            {/if}
        </button>
    {/each}
    <img src="/field.svg" bind:this={field_image} class="field-image" />
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

    .target {
        top: 0;
        left: 0;
        position: absolute;
        width: 25px;
        height: 25px;
        border-radius: 5px;
        border: 2px solid #fff;
        z-index: 0;

        contain: layout;
    }
    .target:hover {
        border-color: #0ae;
    }
    .target.selected {
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
    }
    .rotator:hover {
        background-color: #0ae;
    }
</style>
