<script lang="ts">
    import {
        additional_selected_targets,
        modal_state,
        selected_target,
        settings,
        targets,
    } from "../scripts/store";

    let dialog: HTMLDialogElement | undefined = $state();
    let hidden = $derived(() => $modal_state === "hidden");

    const title = $derived(
        $modal_state === "edit_settings"
            ? "Edit Settings"
            : $modal_state === "confirm_clear"
              ? "Confirm Clear"
              : "DEBUG",
    );

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
            <label for="robot_width">Robot Width:</label>
            <input
                id="robot_width"
                type="number"
                value={$settings.robot_width}
                oninput={(e) => ($settings.robot_width = e.target!.value)}
            />
            <br />
            <label for="robot_height">Robot Height:</label>
            <input
                id="robot_height"
                type="number"
                value={$settings.robot_height}
                oninput={(e) => ($settings.robot_height = e.target!.value)}
            />
        </form>
    {/if}
    {#if $modal_state === "confirm_clear"}
        <button
            onclick={() => {
                selected_target.set(null);
                additional_selected_targets.set([]);
                targets.set([]);
                modal_state.set("hidden")
            }}>CONFIRM</button
        >
        <br />
    {/if}

    <button class="close_button" autofocus onclick={() => dialog!.close()}
        >close modal</button
    >
</dialog>

<style>
    dialog {
        color: #fff;
        background-color: #444;
        border-radius: var(--border-radius);
        padding: 20px;
        border: none;
        position: relative;
    }
</style>
