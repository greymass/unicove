<script lang="ts">
	import { Asset, Int64 } from '@wharfkit/antelope';
	import Code from '$lib/components/code.svelte';
	import type { AccountState } from '$lib/state/client/account.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	const { data } = $props();

	function getStakedBalance(network: NetworkState, account: AccountState): Asset {
		const staked = Int64.from(0);
		if (account && account.loaded) {
			if (account.account?.data.rex_info) {
				staked.add(network.rexToToken(account.account.data.rex_info.rex_balance).units);
			}
			if (account.sources.rexfund) {
				staked.add(Asset.from(account.sources.rexfund.balance).units);
			}
		}
		return Asset.fromUnits(staked, network.chain.systemToken!.symbol);
	}

	let staked: Asset = $derived(getStakedBalance(data.network, data.account));
	let usdValue = $derived(
		Asset.from(
			staked.value * (data.network.tokenprice ? data.network.tokenprice.value : 0),
			'2,USD'
		)
	);
</script>

<div class="space-y-4">
	<h3 class="h3">Staked</h3>
	<Code>{staked}</Code>
	<h3 class="h3">USD</h3>
	<Code>{usdValue}</Code>
	<h3 class="h3">REX State</h3>
	<Code>{JSON.stringify(data.account.network.rexstate, null, 2)}</Code>
</div>
