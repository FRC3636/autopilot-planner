<script lang="ts">
    import { selected_target, targets, type Target } from "../scripts/target";

    var field_image: HTMLElement;

    const field_width = 16.54048; //meters
    const field_height = 8.06958; //meters
    var pixels_to_meters: number = 0;
    var field_container_bounds: DOMRect = new DOMRect();

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

    function handle_click(e: MouseEvent) {
        if (e.target) {
            const elem = e.target as Element;
            if ((elem.getAttribute("class") || "").includes("exclude_tap")) {
                return;
            }
        }

        field_container_bounds = field_image.getBoundingClientRect();
        pixels_to_meters = field_width / field_container_bounds.width;

        const relative_touch_coords = {
            x: e.clientX - field_container_bounds.x,
            y: e.clientY - field_container_bounds.y,
        };
        const real_coords = pixels_to_real(relative_touch_coords);

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
</script>

<div class="field-container" onclick={handle_click}>
    {#each $targets.entries() as [index, target]}
        <div
            class={index === $selected_target
                ? "target selected exclude_tap"
                : "target exclude_tap"}
            style={`transform: translate(
              ${real_to_pixels(target.reference).x - 25 / 2}px,
              ${real_to_pixels(target.reference).y + field_container_bounds.y - 25}px
            )`}
            onclick={() =>
                selected_target.update((value) =>
                    value === index ? null : index,
                )}
        ></div>
    {/each}
    <img src="/field.svg" bind:this={field_image} class="field-image" />
</div>

<style>
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
        border-radius: 100%;
        background-color: #fff;
    }

    .target.selected {
        background-color: #ea0;
    }
</style>
