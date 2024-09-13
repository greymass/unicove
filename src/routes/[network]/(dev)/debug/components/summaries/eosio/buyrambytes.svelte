
<script>
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Code from '$lib/components/code.svelte';
	import Buyrambytes from '$lib/components/summary/eosio/buyrambytes.svelte';

	const action = {
		data: SystemContract.Types.buyrambytes.from({
			payer: 'foo',
			receiver: 'bar',
			bytes: 8192
		})
	};
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::buyrambytes</h3>
	<Code>{JSON.stringify(action, null, 2)}</Code>
	<h4 class="h4">eosio/buyrambytes.svelte</h4>
	<Buyrambytes {action} />
</div>
