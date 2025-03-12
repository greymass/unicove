<script>
	import Code from '$lib/components/code.svelte';
	import Mvfrsavings from '$lib/components/summary/eosio/mvfrsavings.svelte';
	import { Types } from '$lib/types/rex';

	const data = Types.mvfrsavings.from({
		owner: 'foo',
		rex: '10000.0000 REX'
	});
</script>

<div class="card space-y-4">
	<h3 class="h3">eosio::mvfrsavings</h3>
	<Code>{JSON.stringify(data, null, 2)}</Code>
	<h4 class="h4">buyrex.svelte</h4>
	<Mvfrsavings {data} />
</div>
