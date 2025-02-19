<script>
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Code from '$lib/components/code.svelte';
	import Buyram from '$lib/components/summary/eosio/buyram.svelte';

	const data = SystemContract.Types.buyram.from({
		payer: 'foo',
		receiver: 'bar',
		quant: '10000.0000 EOS'
	});
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::buyram</h3>
	<Code>{JSON.stringify(data, null, 2)}</Code>
	<h4 class="h4">eosio/buyram.svelte</h4>
	<Buyram {data} />
</div>
