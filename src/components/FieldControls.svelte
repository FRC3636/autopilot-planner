<script lang="ts">
    import Mirror from "./icon/Mirror.svelte";
    import {
        targets,
        selected_target,
        additional_selected_targets,
        type Target,
        modal_state,
        snapping_enabled,
        multi_select_enabled,
    } from "../scripts/store";
    import { field_height, field_width } from "../scripts/helpers";
    import Trash from "./icon/Trash.svelte";
    import Duplicate from "./icon/Duplicate.svelte";
    import Clear from "./icon/Clear.svelte";

    window.addEventListener("keydown", (e) => {
        const active_elem = document.activeElement;
        const is_in_text_input =
            active_elem?.tagName === "INPUT" ||
            active_elem?.tagName === "TEXTAREA";

        if (is_in_text_input) return;

        switch (e.key) {
            case "Escape":
                selected_target.set(null);
                additional_selected_targets.set([]);
                break;
            case "Alt":
                snapping_enabled.set(true);
                break;
            case "Shift":
                multi_select_enabled.set(true);
                break;
            case "Backspace":
                handle_delete();
                break;
            case "D":
                handle_duplicate();
                break;
            case "H":
            case "h":
                handle_mirror("horizontal");
                break;
            case "V":
            case "v":
                handle_mirror("vertical");
                break;
            case ",":
                if (e.ctrlKey) {
                    modal_state.set("edit_settings");
                }
                break;
        }
    });
    window.addEventListener("keyup", (e) => {
        switch (e.key) {
            case "Alt":
                snapping_enabled.set(false);
            case "Shift":
                multi_select_enabled.set(false);
        }
    });

    function all_selected(): number[] {
        return [
            ...$additional_selected_targets,
            ...($selected_target !== null ? [$selected_target] : []),
        ];
    }

    function handle_mirror(direction: "vertical" | "horizontal") {
        const targets_to_mirror = all_selected();
        const mirror_func =
            direction === "horizontal"
                ? ({
                      x,
                      y,
                      rotation,
                  }: {
                      x: number;
                      y: number;
                      rotation: number;
                  }) => ({
                      y,
                      x: field_width - x,
                      rotation: Math.PI - rotation,
                  })
                : ({
                      x,
                      y,
                      rotation,
                  }: {
                      x: number;
                      y: number;
                      rotation: number;
                  }) => ({
                      y: field_height - y,
                      x,
                      rotation: -rotation,
                  });

        let current_targets = $targets;
        targets_to_mirror.map((index) => {
            const target = current_targets[index];
            const new_pos = mirror_func(target.reference);
            current_targets[index].reference = new_pos;
        });
        targets.set(current_targets);
        console.log(current_targets);
    }

    function handle_delete() {
        const to_delete = all_selected();
        targets.set($targets.filter((t, index) => !to_delete.includes(index)));
        additional_selected_targets.set(
            $additional_selected_targets.filter(
                (index) => !to_delete.includes(index),
            ),
        );
        selected_target.set(null);
    }

    function handle_duplicate() {
        const new_selected_target =
            $selected_target != null
                ? $selected_target + $targets.length
                : null;
        const new_add_selections = $additional_selected_targets.map(
            (i) => $targets.length + i,
        );
        const new_targets = all_selected().map((index) => {
            let target = structuredClone($targets[index]);
            target.name = `Target ${index + $targets.length}`;
            return target;
        });
        targets.set($targets.concat(new_targets));
        selected_target.set(new_selected_target);
        additional_selected_targets.set(new_add_selections);
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
        class="control destructive"
        aria-label="Delete"
        onclick={() => handle_delete()}
    >
        <Trash />
    </button>
    <button
        class="control"
        aria-label="Duplicate"
        onclick={() => handle_duplicate()}
    >
        <Duplicate />
    </button>
    <button
        class="control destructive"
        aria-label="Clear All"
        onclick={() => modal_state.set("confirm_clear")}
    >
        <Clear />
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
        color: var(--fg);
    }
    .control:hover {
        color: var(--hover);
    }
    .control:active {
        color: var(--active);
    }

    .destructive:hover {
        color: var(--hover-destructive);
    }
</style>
