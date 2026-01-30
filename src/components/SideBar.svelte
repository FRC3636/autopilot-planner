<script lang="ts">
    import {
        copy_kotlin_to_clipboard,
        download_json_save,
        export_targets_to_kotlin_enum,
    } from "../scripts/export";
    import {
        modal_state,
        selected_target,
        targets,
        settings,
        type Target,
    } from "../scripts/store";
    import Minus from "./icon/Minus.svelte";
    import Plus from "./icon/Plus.svelte";
    import Trash from "./icon/Trash.svelte";
    import NumberInput from "./NumberInput.svelte";

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
                    value={current_target()!.reference.x.toFixed(2)}
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
                    value={current_target()!.reference.y.toFixed(2)}
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
                    value={current_target()!.reference.rotation.toFixed(2)}
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
                <NumberInput
                    nullable={{ default: 1.0 }}
                    value={current_target()!.ending_velocity}
                    onchange={(v) =>
                        set_selected_target_prop("ending_velocity", v)}
                />
            </label>
            <br />
            <label>
                Entry Angle:
                <NumberInput
                    nullable={{ default: 0.0 }}
                    value={current_target()!.entry_angle}
                    onchange={(v) => set_selected_target_prop("entry_angle", v)}
                />
            </label>
            <br />
            <label>
                Turning Radius:
                <NumberInput
                    nullable={{ default: 1.0 }}
                    value={current_target()!.turning_radius}
                    onchange={(v) =>
                        set_selected_target_prop("turning_radius", v)}
                />
            </label>
        </form>
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
        <button
            onclick={() => download_json_save($targets, $settings, "data.json")}
        >
            Export to JSON
        </button>
        <br />
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

    form {
        border: 1px solid #fff;
        border-radius: var(--border-radius);
        display: flex;
        flex-direction: column;
        padding-block: 14px;
        background-color: #444;
    }
    form > * {
        border-top: 1px solid #fff;
        padding-inline: 10px;
        padding-block: 6px;
    }
    form :first-child {
        border-top: none;
    }
</style>
