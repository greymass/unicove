<script>
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Code from '$lib/components/code.svelte';
	import Buyrex from '$lib/components/summary/eosio/buyrex.svelte';

	const action = {
		data: SystemContract.Types.buyrex.from({
			from: 'foo',
			amount: '10000.0000 EOS'
		})
	};
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::buyrex</h3>
	<Code>{JSON.stringify(action, null, 2)}</Code>
	<h4 class="h4">eosio/buyrex.svelte</h4>
	<Buyrex {action} />
</div>
