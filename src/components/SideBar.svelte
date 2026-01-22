<script lang="ts">
    import { selected_target, targets } from "../scripts/target";

    $: current_target =
        $selected_target !== null ? $targets[$selected_target] : null;
</script>

<div>
    {#if current_target}
        <h1>{current_target.name}</h1>
        <ul>
            <li>
                <h2>Pose</h2>
                <ul>
                    <li>X: {current_target.reference.x}</li>
                    <li>Y: {current_target.reference.y}</li>
                    <li>ϑ: {current_target.reference.rotation}</li>
                </ul>
            </li>
            <li>
                <h2>Constants</h2>
                <ul>
                    <li>Ending Velocity: {current_target.ending_velocity}</li>
                    <li>Entry Angle: {current_target.entry_angle}</li>
                    <li>Rotation Radius: {current_target.entry_angle}</li>
                </ul>
            </li>
        </ul>
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
