<script lang="ts">
    import {
        copy_kotlin_to_clipboard,
        export_targets_to_kotlin_enum,
    } from "../scripts/export";
    import {
        modal_state,
        selected_target,
        targets,
        type Target,
    } from "../scripts/store";

    const current_target = $derived(() =>
        $selected_target !== null ? $targets[$selected_target] : null,
    );

    function set_selected_target_prop<T extends keyof Target>(
        prop: T,
        value: Target[T],
    ) {
        if ($selected_target !== null) {
            $targets[$selected_target][prop] = value;
        }
    }

    function set_selected_target_reference(value: {
        x?: number;
        y?: number;
        rotation?: number;
    }) {
        if ($selected_target !== null) {
            const updated_reference = {
                ...$targets[$selected_target].reference,
                ...value,
            };
            $targets[$selected_target].reference = updated_reference;
        }
    }
</script>

<div>
    {#if current_target()}
        <h1>{current_target()!.name}</h1>
        <h2>Pose</h2>
        <form>
            <label>
                X:
                <input
                    type="number"
                    value={current_target()!.reference.x}
                    step="0.1"
                    oninput={(e) =>
                        set_selected_target_reference({
                            x: parseFloat(e.currentTarget.value),
                        })}
                />
            </label>
            <br />
            <label>
                Y:
                <input
                    type="number"
                    value={current_target()!.reference.y}
                    step="0.1"
                    oninput={(e) =>
                        set_selected_target_reference({
                            y: parseFloat(e.currentTarget.value),
                        })}
                />
            </label>
            <br />
            <label>
                θ:
                <input
                    type="number"
                    value={current_target()!.reference.rotation}
                    step="0.1"
                    oninput={(e) =>
                        set_selected_target_reference({
                            rotation: parseFloat(e.currentTarget.value),
                        })}
                />
            </label>
        </form>
        <h2>Constants</h2>
        <form>
            <label>
                Ending Velocity:
                <input
                    type="number"
                    disabled={current_target()!.ending_velocity === undefined}
                    value={current_target()!.ending_velocity}
                />
                <button
                    type="button"
                    onclick={() =>
                        set_selected_target_prop("ending_velocity", 1.0)}
                >
                    Add
                </button>
                <button
                    type="button"
                    onclick={() =>
                        set_selected_target_prop("ending_velocity", undefined)}
                >
                    Remove
                </button>
            </label>
            <br />
            <label>
                Entry Angle:
                <input
                    type="number"
                    disabled={current_target()!.entry_angle === undefined}
                    value={current_target()!.entry_angle}
                />
                <button
                    type="button"
                    onclick={() => set_selected_target_prop("entry_angle", 0.0)}
                >
                    Add
                </button>
                <button
                    type="button"
                    onclick={() =>
                        set_selected_target_prop("entry_angle", undefined)}
                >
                    Remove
                </button>
            </label>
            <br />
            <label>
                Turning Radius:
                <input
                    type="number"
                    disabled={current_target()!.turning_radius === undefined}
                    value={current_target()!.turning_radius}
                />
                <button
                    type="button"
                    onclick={() =>
                        set_selected_target_prop("turning_radius", 1.0)}
                >
                    Add
                </button>
                <button
                    type="button"
                    onclick={() =>
                        set_selected_target_prop("turning_radius", undefined)}
                >
                    Remove
                </button>
            </label>
        </form>
        <button
            onclick={() => {
                $targets = $targets.filter(
                    (_, index) => index != $selected_target,
                );
            }}
        >
            Delete
        </button>
    {:else}
        <h1>Targets</h1>
        <ul>
            {#each $targets.entries() as [index, target]}
                <li>
                    <button onclick={() => selected_target.set(index)}
                        >{target.name}</button
                    >
                </li>
            {/each}
        </ul>
        <hr />
        <h1>Config</h1>
        <button onclick={() => copy_kotlin_to_clipboard($targets)}>
            Export to Clipboard
        </button>
        <button onclick={() => modal_state.set("edit_settings")}>
            Edit Settings
        </button>
    {/if}
</div>

<style>
    ul {
        padding-left: 10px;
    }
    li {
        margin-block: 0.3em;
        padding-left: 10px;
    }
    li::marker {
        content: "-";
    }
</style>
