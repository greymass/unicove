<script lang="ts">
	import PermissionTree from './permissiontree.svelte';

	const { data } = $props();

	console.log(JSON.stringify(data.tree, null, 2));
</script>

{#if data.account}
	<PermissionTree permissions={data.tree} />
{/if}
