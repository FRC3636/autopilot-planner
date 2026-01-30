<script lang="ts">
    import Plus from "./icon/Plus.svelte";
    import Trash from "./icon/Trash.svelte";

    interface Props {
        nullable: false | { default: number };
        value?: number;
        onchange?: (value: number | undefined) => void;
    }
    const { nullable = false, value = $bindable(), onchange }: Props = $props();
</script>

<input
    type="number"
    disabled={value === undefined}
    value={value?.toFixed(2)}
    step="0.1"
    oninput={(e) => onchange?.(parseFloat(e.currentTarget.value))}
/>
{#if nullable !== false}
    {#if value !== undefined}
        <button type="button" onclick={() => onchange?.(undefined)}>
            <Trash height="16" width="16" />
        </button>
    {:else}
        <button type="button" onclick={() => onchange?.(nullable.default)}>
            <Plus height="16" width="16" />
        </button>
    {/if}
{/if}
