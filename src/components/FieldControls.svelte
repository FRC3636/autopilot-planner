<script lang="ts">
    import Mirror from "./icon/Mirror.svelte";
    import {
        targets,
        selected_target,
        additional_selected_targets,
        type Target,
    } from "../scripts/store";
    import { field_height, field_width } from "../scripts/helpers";
    import Trash from "./icon/Trash.svelte";

    function all_selected(): number[] {
        let all_targets = $additional_selected_targets.concat(
            $selected_target !== null ? [$selected_target] : [],
        );
        if ($selected_target !== null) {
            all_targets.push($selected_target);
        }
        return all_targets;
    }

    function handle_mirror(direction: "vertical" | "horizontal") {
        const targets_to_mirror = all_selected();
        const mirror_func =
            direction === "horizontal"
                ? ({ x, y }: { x: number; y: number }) => ({
                      y,
                      x: field_width - x,
                  })
                : ({ x, y }: { x: number; y: number }) => ({
                      y: field_height - y,
                      x,
                  });

        let current_targets = $targets;
        targets_to_mirror.map((index) => {
            const target = current_targets[index];
            const new_pos = mirror_func(target.reference);
            current_targets[index].reference = {
                ...target.reference,
                ...new_pos,
            };
        });
        targets.set(current_targets);
        console.log(current_targets);
    }
</script>

<div class="field_controls">
    <button
        class="control"
        aria-label="Mirror Horizontally"
        onclick={() => handle_mirror("horizontal")}
    >
        <Mirror style="transform: rotateZ(90deg);" />
    </button>
    <button
        class="control"
        aria-label="Mirror Vertically"
        onclick={() => handle_mirror("vertical")}
    >
        <Mirror />
    </button>
    <button
        class="control"
        aria-label="Delete"
        onclick={() => {
            const to_delete = all_selected();
            targets.set(
                $targets.filter((t, index) => !to_delete.includes(index)),
            );
            additional_selected_targets.set(
                $additional_selected_targets.filter(
                    (index) => !to_delete.includes(index),
                ),
            );
            selected_target.set(null);
        }}
    >
        <Trash />
    </button>
</div>

<style>
    .field_controls {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .control {
        all: unset;
        color: #fff;
    }
    .control:hover {
        color: #ce2;
    }
    .control:active {
        color: #c2e;
    }
</style>
