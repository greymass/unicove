<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
	<Pageheader
		title={m.contract_actions_page_title()}
		subtitle={m.contract_actions_page_description({
			actions: data.abi.actions.length,
			contract: data.contract,
			network: data.network.chain.name
		})}
	/>

	{#each data.abi.actions as action}
		<a href="/{data.network}/contract/{data.contract}/actions/{action.name}">
			{action.name}
		</a>
	{/each}
</Stack>
