<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Action from './action.svelte';

	const { data } = $props();
</script>

<Stack>
	<p>The actions for this contract with their input parameters and potential response data.</p>
	<ul class="grid grid-cols-[auto_1fr] gap-2 overflow-x-auto">
		{#each data.abi.actions as action}
			<Action abi={data.abi} contract={data.contract} network={data.network} {action} />
		{/each}
	</ul>
</Stack>
