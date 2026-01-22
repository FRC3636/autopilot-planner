<script lang="ts">
    import { selected_target, targets } from "../scripts/target";

    $: current_target =
        $selected_target !== null ? $targets[$selected_target] : null;
</script>

<div>
    <h1>Selected Target</h1>
    {#if current_target}
        <h2>Pose</h2>
        <p>X: {current_target.pose.x}</p>
        <p>Y: {current_target.pose.y}</p>
        <p>ϑ: {current_target.pose.x}</p>
        <h2>Constants</h2>
        <p>Ending Velocity: {current_target.ending_velocity}</p>
        <p>Entry Angle: {current_target.entry_angle}</p>
        <p>Rotation Radius: {current_target.entry_angle}</p>
    {/if}
</div>
