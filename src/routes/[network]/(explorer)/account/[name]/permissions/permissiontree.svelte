<script lang="ts">
	import Permission from './permission.svelte';

	let props = $props();
</script>

<ul class="grid grid-cols-[auto_1fr] overflow-x-auto">
	{#each props.permissions as permission}
		<Permission {permission} />
	{/each}
</ul>
