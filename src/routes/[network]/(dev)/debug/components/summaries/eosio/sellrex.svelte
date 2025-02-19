<script>
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Code from '$lib/components/code.svelte';
	import Sellrex from '$lib/components/summary/eosio/sellrex.svelte';

	const data = SystemContract.Types.sellrex.from({
		from: 'eosio',
		rex: '10000.0000 REX'
	});
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::sellrex</h3>
	<Code>{JSON.stringify(data, null, 2)}</Code>
	<h4 class="h4">eosio/sellrex.svelte</h4>
	<Sellrex {data} />
</div>
