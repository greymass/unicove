<script lang="ts">
	import Permission from './permission.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<div class="grid grid-cols-[1fr_auto] gap-y-6">
		{#each data.tree as permission}
			<Permission {permission} />
		{/each}
	</div>
{/if}
