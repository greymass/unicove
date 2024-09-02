<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
	<Pageheader
		title={m.contract_abi_page_title()}
		subtitle={m.contract_abi_page_description({
			contract: data.contract,
			network: data.network.chain.name
		})}
	/>
	<Code lang="json">{JSON.stringify(data.abi, null, 2)}</Code>
</Stack>
