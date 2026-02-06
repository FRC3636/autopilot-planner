<script lang="ts">
    import Plus from "./icon/Plus.svelte";
    import Trash from "./icon/Trash.svelte";

    interface Props {
        nullable: false | { default: number };
        value?: number;
        onchange?: (value: number | undefined) => void;
        [x: string]: any;
    }
    const {
        nullable = false,
        value,
        onchange,
        ...others
    }: Props = $props();
</script>

<div class="number-input">
    <input
        type="number"
        disabled={value === undefined}
        value={value?.toFixed(2)}
        step="0.1"
        oninput={(e) => onchange?.(parseFloat(e.currentTarget.value))}
        {...others}
    />
    {#if nullable !== false}
        {#if value !== undefined}
            <button type="button" onclick={() => onchange?.(undefined)}>
                <Trash height="18" width="18" />
            </button>
        {:else}
            <button type="button" onclick={() => onchange?.(nullable.default)}>
                <Plus height="18" width="18" />
            </button>
        {/if}
    {/if}
</div>

<style>
    button {
        all: unset;
    }
    button:hover {
        color: var(--hover);
    }
    button:active {
        color: var(--active);
    }

    .number-input {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    input {
        width: 5ch;
    }
</style>
