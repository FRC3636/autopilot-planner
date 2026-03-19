<script lang="ts">
    import {
        copy_kotlin_to_clipboard,
        download_json_save,
        export_targets_to_kotlin_enum,
        import_state_from_json,
    } from "../scripts/export";
    import {
        modal_state,
        selected_target,
        targets,
        settings,
        type Target,
    } from "../scripts/store";
    import NumberInput from "./NumberInput.svelte";
    import Export from "./icon/Export.svelte";
    import Import from "./icon/Import.svelte";

    function open_json_import() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async () => {
            const file = input.files?.item(0);
            if (!file) return;
            const state = import_state_from_json(await file.text());
            targets.set(state.targets);
            settings.set(state.settings);
        };
        input.click();
    }

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
            <div class="input_group">
                <label for="x-coord"> X Position: </label>
                <input
                    type="number"
                    value={current_target()!.reference.x.toFixed(2)}
                    step="0.1"
                    onchange={(e) =>
                        set_selected_target_reference({
                            x: parseFloat(e.currentTarget.value),
                        })}
                    id="x-coord"
                />
            </div>
            <br />
            <div class="input_group">
                <label for="y-coord"> Y Position: </label>
                <input
                    type="number"
                    value={current_target()!.reference.y.toFixed(2)}
                    step="0.1"
                    onchange={(e) =>
                        set_selected_target_reference({
                            y: parseFloat(e.currentTarget.value),
                        })}
                    id="y-coord"
                />
            </div>
            <br />
            <div class="input_group">
                <label for="rotation"> Rotation: </label>
                <input
                    type="number"
                    value={current_target()!.reference.rotation.toFixed(2)}
                    step="0.1"
                    onchange={(e) =>
                        set_selected_target_reference({
                            rotation: parseFloat(e.currentTarget.value),
                        })}
                    id="rotation"
                />
            </div>
        </form>
        <h2>Constants</h2>
        <form>
            <div class="input_group">
                <label for="ending_velocity"> Ending Velocity: </label>
                <NumberInput
                    nullable={{ default: 1.0 }}
                    value={current_target()!.ending_velocity}
                    onchange={(v) =>
                        set_selected_target_prop("ending_velocity", v)}
                    id="ending_velocity"
                />
            </div>

            <br />
            <div class="input_group">
                <label for="entry_angle"> Entry Angle: </label>
                <NumberInput
                    nullable={{ default: 0.0 }}
                    value={current_target()!.entry_angle}
                    onchange={(v) => set_selected_target_prop("entry_angle", v)}
                    id="entry_angle"
                />
            </div>

            <br />
            <div class="input_group">
                <label for="turning_radius"> Turning Radius: </label>
                <NumberInput
                    nullable={{ default: 1.0 }}
                    value={current_target()!.turning_radius}
                    onchange={(v) =>
                        set_selected_target_prop("turning_radius", v)}
                    id="turning_radius"
                />
            </div>

            <br />
            <div class="input_group">
                <label for="tolerance"> Tolerance: </label>
                <NumberInput
                    nullable={{ default: 0.05 }}
                    value={current_target()!.tolerance}
                    onchange={(v) => set_selected_target_prop("tolerance", v)}
                    id="tolerance"
                />
            </div>
        </form>
    {:else}
        <h1>Targets</h1>
        <ul>
            {#each $targets.entries() as [index, target]}
                <li>
                    <button
                        class="target"
                        onclick={() => selected_target.set(index)}
                        >{target.name}</button
                    >
                </li>
            {/each}
        </ul>
        <hr />
        <h1>Config</h1>

        <div class="export_options">
            <button
                class="large"
                onclick={() => copy_kotlin_to_clipboard($targets)}
            >
                <Export width="16" height="16" /> Clipboard
            </button>
            <button
                class="large"
                onclick={() =>
                    download_json_save($targets, $settings, "data.json")}
            >
                <Export width="16" height="16" /> JSON
            </button>
        </div>
        <br />
        <button class="large" onclick={open_json_import}>
            <Import width="16" height="16" /> Import JSON
        </button>
        <br />
        <button class="large" onclick={() => modal_state.set("edit_settings")}>
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
        border: 1px solid var(--fg);
        border-radius: var(--border-radius);
        display: flex;
        flex-direction: column;
        padding-block: 8px;
        background-color: var(--surface-0);
    }
    form > * {
        border-top: 1px solid var(--fg);
        padding-inline: 10px;
        padding-block: 6px;
    }
    form :first-child {
        border-top: none;
    }

    .input_group {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .input_group :first-child {
        justify-self: left;
    }
    .input_group * {
        justify-self: right;
    }

    button {
        all: unset;
        cursor: pointer;
    }

    button.target {
        text-decoration: underline var(--accent) 1px;
    }
    button.target:hover {
        color: var(--hover);
    }
    button.target:active {
        color: var(--active);
    }

    button.large {
        background-color: var(--surface-0);
        border: 1px solid var(--fg);
        border-radius: 10px;
        padding-block: 4px;
        padding-inline: 8px;

        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5ch;
    }
    button.large:hover {
        background-color: var(--surface-1);
        border-color: var(--hover);
    }
    button.large:active {
        background-color: var(--surface-1);
        border-color: var(--active);
    }

    input {
        width: 5ch;
        text-align: center;
    }

    .export_options {
        display: flex;
        flex-direction: row;
        width: 100%;
        gap: 8px;
    }
    .export_options * {
        width: 100%;
        justify-content: center;
    }
</style>
