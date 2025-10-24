<script lang="ts">
	import { Contract } from '@wharfkit/contract';
	import { setContext } from 'svelte';

	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	setContext(
		'contract',
		new Contract({
			abi: data.abi,
			account: data.contract,
			client: data.network.client
		})
	);

	const options = $derived.by(() => {
		const account = String(data.contract);
		const network = String(data.network);
		return [
			{ href: `/${network}/contract/${account}`, text: 'Overview' },
			{
				href: `/${network}/contract/${account}/actions`,
				text: `Actions (${data.abi.actions.length})`
			},
			{
				href: `/${network}/contract/${account}/structs`,
				text: `Structs (${data.abi.structs.length})`
			},
			{
				href: `/${network}/contract/${account}/tables`,
				text: `Tables (${data.abi.tables.length})`
			},
			{ href: `/${network}/contract/${account}/abi`, text: 'ABI' }
		];
	});
</script>

<PillGroup {options} />

{@render children()}
