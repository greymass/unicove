<!-- The Grid is like the Cluster but with all elements aligned to columns and rows -->

<script lang='ts'>
const {class: className = '', children, itemWidth = '20ch', ...props} = $props();
</script>

<div class={`grid gap-4`} {...props} style={`--itemWidth:${itemWidth}`}>
	{@render children()}
</div>

<style>
	.grid {
		grid-template-columns: repeat(auto-fit, minmax(min(var(--itemWidth), 100%), 1fr));
	}
</style>
