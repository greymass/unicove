<script>
	import Code from '$lib/components/code.svelte';
	import Withdraw from '$lib/components/summary/eosio/withdraw.svelte';
	import { Types } from '$lib/types/rex';

	const data = Types.withdraw.from({
		owner: 'foo',
		amount: '10000.0000 EOS'
	});
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::withdraw</h3>
	<Code>{JSON.stringify(data, null, 2)}</Code>
	<h4 class="h4">eosio/withdraw.svelte</h4>
	<Withdraw {data} />
</div>
