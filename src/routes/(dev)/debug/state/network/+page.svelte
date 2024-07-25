<script lang="ts">
	import { network } from '$lib/state/network.svelte';
	import { Asset } from '@wharfkit/antelope';
	import Button from '$lib/components/button/button.svelte';

	const rexToToken = $derived.by(() => {
		if (!network.rexstate) {
			return 0;
		}
		return network.tokenToRex(Asset.from('1.0000 EOS'));
	});
</script>

<h1>Network State</h1>
{#if network && network.rexstate}
	<p>rexToToken({rexToToken}): {network.rexToToken(rexToToken)}</p>
	<p>tokenToRex(1): {rexToToken}</p>
{/if}
<Button onclick={() => network.refresh()}>Refresh</Button>
<pre>
{JSON.stringify(network, null, 2)}
</pre>
