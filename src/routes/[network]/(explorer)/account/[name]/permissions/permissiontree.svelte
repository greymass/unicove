<script lang="ts">
	import Permission from './permission.svelte';

	let props = $props();
</script>

<ul class="grid grid-cols-[1fr_auto]">
	{#each props.permissions as permission}
		<Permission {permission} />
	{/each}
</ul>
