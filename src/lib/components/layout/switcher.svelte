<!-- The Switcher switches a flexbox context between horizontal and a vertical layout at a given, parent container-based breakpoint. If the breakpoint is 30rem the layout will switch to vertical when the parent is less than 30rem wide. Useful when all elements inside the switcher are considered equal. -->

<script lang="ts">
	const { class: className = '', children, threshold = '30rem', ...props } = $props();
</script>

<div
	class={`switcher flex flex-wrap gap-4 ${className}`}
	{...props}
	style={`--threshold:${threshold}`}
>
	{@render children()}
</div>

<style>
	.switcher :global(> *) {
		flex-grow: 1;
		flex-basis: calc((var(--threshold) - 100%) * 999);
	}
</style>
