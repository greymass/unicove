<script lang="ts">
	import PermissionTree from './permissiontree.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<PermissionTree permissions={data.tree} />
{/if}
