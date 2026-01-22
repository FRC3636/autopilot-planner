<script lang="ts">
    import { selected_target, targets } from "../scripts/target";

    $: current_target =
        $selected_target !== null ? $targets[$selected_target] : null;
</script>

<div>
    <h1>Selected Target</h1>
    {#if current_target}
        <ul>
            <li>
                <h2>Pose</h2>
                <ul>
                    <li>X: {current_target.pose.x}</li>
                    <li>Y: {current_target.pose.y}</li>
                    <li>ϑ: {current_target.pose.rotation}</li>
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
