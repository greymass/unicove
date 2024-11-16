<script lang="ts">
	export const { name, contract = false, children } = $props();

	const path = contract ? '/contract/' + name : '/account/' + name;
</script>

<a href={path}>
	{#if children}
		{@render children()}
	{:else}
		{name}
	{/if}
</a>
