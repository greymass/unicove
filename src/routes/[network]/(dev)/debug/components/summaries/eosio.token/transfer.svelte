<script>
	import * as TokenContract from '$lib/wharf/contracts/token';
	import Code from '$lib/components/code.svelte';
	import Transfer from '$lib/components/summary/eosio.token/transfer.svelte';

	const data = TokenContract.Types.transfer.from({
		from: 'foo',
		to: 'bar',
		quantity: '10000.0000 EOS',
		memo: 'testing memo'
	});
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio.token::transfer</h3>
	<Code>{JSON.stringify(data, null, 2)}</Code>
	<h4 class="h4">eosio.token/transfer.svelte</h4>
	<Transfer {data} />
</div>
