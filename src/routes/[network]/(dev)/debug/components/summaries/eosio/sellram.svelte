<script>
	import * as SystemContract from '$lib/wharf/contracts/system';
	import Code from '$lib/components/code.svelte';
	import Sellram from '$lib/components/summary/eosio/sellram.svelte';

	const action = {
		data: SystemContract.Types.sellram.from({
			account: 'foo',
			bytes: 8192
		})
	};
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::sellram</h3>
	<Code>{JSON.stringify(action, null, 2)}</Code>
	<h4 class="h4">eosio/sellram.svelte</h4>
	<Sellram {action} />
</div>
