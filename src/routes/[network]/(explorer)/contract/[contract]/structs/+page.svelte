<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { data } = $props();
</script>

<Stack>
	<Pageheader
		title={m.contract_struct_page_title()}
		subtitle={m.contract_struct_page_description({
			structs: data.abi.structs.length,
			contract: String(data.contract),
			network: data.network.chain.name
		})}
	/>
	{#each data.abi.structs as struct}
		<a href="/{data.network}/contract/{data.contract}/structs/{struct.name}">
			{struct.name}
		</a>
	{/each}
</Stack>
