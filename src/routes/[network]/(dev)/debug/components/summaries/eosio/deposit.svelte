<script>
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Code from '$lib/components/code.svelte';
	import Deposit from '$lib/components/summary/eosio/deposit.svelte';

	const data = SystemContract.Types.deposit.from({
		owner: 'foo',
		amount: '10000.0000 EOS'
	});
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::deposit</h3>
	<Code>{JSON.stringify(data, null, 2)}</Code>
	<h4 class="h4">eosio/deposit.svelte</h4>
	<Deposit {data} />
</div>
