<script lang="ts">
    import {
        additional_selected_targets,
        modal_state,
        selected_target,
        settings,
        targets,
        type ModalState,
    } from "../scripts/store";
    import { THEME_SELECTIONS } from "../scripts/theme";
    import NumberInput from "./NumberInput.svelte";

    let dialog: HTMLDialogElement | undefined = $state();
    let hidden = $derived(() => $modal_state === "hidden");

    function get_title(state: ModalState): string {
        switch (state) {
            case "edit_settings":
                return "Edit Settings";
            case "confirm_clear":
                return "Clear Targets?";
            case "edit_name":
                return "Edit Target Name";
        }
        return "DEBUG";
    }

    const title = $derived(get_title($modal_state));
    const width = $derived($settings.robot_width);
    const height = $derived($settings.robot_height);

    $effect(() => {
        if (!hidden()) {
            dialog!.showModal();
        } else {
            dialog!.close();
        }
    });
</script>

<dialog
    bind:this={dialog}
    onclose={() => ($modal_state = "hidden")}
    onclick={(e) => {
        if (e.target === dialog) dialog.close();
    }}
>
    <h1>{title}</h1>

    {#if $modal_state === "edit_settings"}
        <form>
            <div class="input_group">
                <label for="robot_width"> Robot width: </label>
                <input
                    id="robot_width"
                    step="0.1"
                    type="number"
                    value={$settings.robot_width}
                    oninput={(e) => ($settings.robot_width = e.target!.value)}
                />
            </div>
            <br />
            <div class="input_group">
                <label for="robot_height"> Robot height: </label>
                <input
                    id="robot_height"
                    step="0.1"
                    type="number"
                    value={$settings.robot_height}
                    oninput={(e) => ($settings.robot_height = e.target!.value)}
                />
            </div>
            <br />
            <label for="theme"> Theme: </label>
            <select
                id="theme"
                value={$settings.theme}
                oninput={(e) => ($settings.theme = e.target!.value)}
            >
                {#each THEME_SELECTIONS as theme}
                    <option value={theme}>{theme}</option>
                {/each}
            </select>
        </form>
    {/if}
    {#if $modal_state === "confirm_clear"}
        <button
            class="clear_button"
            onclick={() => {
                selected_target.set(null);
                additional_selected_targets.set([]);
                targets.set([]);
                modal_state.set("hidden");
            }}>CONFIRM</button
        >
        <br />
    {/if}
    {#if $modal_state === "edit_name"}
        <label for="name"> Name: </label>
        <input
            id="name"
            type="text"
            value={$targets[$selected_target!].name}
            oninput={(e) =>
                ($targets[$selected_target!].name = e.target!.value)}
        />
    {/if}
</dialog>

<style>
    dialog {
        color: var(--fg);
        background-color: var(--bg-2);
        border-radius: var(--border-radius);
        padding: 20px;
        border: none;
        position: relative;
    }

    .clear_button {
        all: unset;
        cursor: pointer;

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
    .clear_button:hover {
        border-color: var(--hover-destructive);
        background-color: var(--surface-1);
    }
    .clear_button:active {
        background-color: var(--surface-1);
        border-color: var(--active);
    }

    .input_group {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    input {
        max-width: 5ch;
    }
</style>
