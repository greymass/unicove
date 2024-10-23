<script lang="ts">
	import { getContext } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import { formatAsset } from '$lib/utils/assets';

	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { calculateValue } from '$lib/utils';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const ramState = $derived(data.network.ramstate);

	let marketCapEOS: Asset | undefined = $state();
	let ramSupply: Asset | undefined = $state();

	$effect(() => {
		if (ramState) {
			const quoteBalanceEOS = ramState.quote.balance.value;
			const connectorWeight = ramState.quote.weight.value;
			marketCapEOS = Asset.from(
				quoteBalanceEOS / connectorWeight,
				data.network.chain.systemToken?.symbol || '0, UNKNOWN'
			);
			ramSupply = Asset.from((ramState?.base.balance.value || 0) / (1000 * 1000 * 1000), '2,GB');
		}
	});

	let marketCapUSDValue = $derived(
		marketCapEOS && data.network.ramprice?.usd
			? calculateValue(marketCapEOS, data.network.ramprice?.usd)
			: undefined
	);

	let ramOwned = $derived(Asset.from(Number(context.account?.ram?.max || 0) / 1000, '4,KB'));
</script>

<div class="space-y-4 p-4 text-white">
	<div class="p-4">
		<div class="flex flex-col items-start justify-between md:flex-row">
			<div class="mb-4 w-full md:mb-0 md:w-1/2">
				<h1 class="text-xl font-bold">RAM</h1>
				<p class="font-light text-gray-400">Owned</p>
				<p class="text-2xl font-bold text-white">{String(ramOwned) || '0'}</p>
				<div class="mt-4 flex space-x-2">
					<Button
						class="flex-1 bg-blue-500 hover:bg-blue-600"
						href="/{String(data.network)}/ram/buy">Buy</Button
					>
					<Button
						class="flex-1 bg-blue-500 hover:bg-blue-600"
						href="/{String(data.network)}/ram/sell">Sell</Button
					>
				</div>
			</div>
			<div class="mt-4 w-full text-left md:mt-0 md:w-1/2 md:p-8">
				<p class="text-left text-gray-400">Total RAM Value USD</p>
				<p class="text-left text-xl font-bold text-white">{String(ramOwned)}</p>
				<hr class="my-2 border-gray-600" />
				<p class="text-left text-gray-400">
					Total RAM Value {data.network.chain.systemToken?.symbol.code || ''}
				</p>
				<p class="text-left text-xl font-bold text-white">
					$ {String(
						context.account?.ram?.max && data.network.ramprice?.usd
							? calculateValue(ramOwned, data.network.ramprice?.usd)
							: '0'
					)}
				</p>
			</div>
		</div>
	</div>

	<Card class="bg-gray-800 p-4">
		<RamPriceHistory data={data.historicalPrices} />
	</Card>

	<div class="text-m mb-20 flex">
		<Card class="mr-2 h-32 w-full bg-gray-800">
			<p class="text-left text-gray-400">RAM Market Cap</p>
			<p class="font-bold text-white">{marketCapEOS ? formatAsset(marketCapEOS) : '0 EOS'}</p>
			<p class="font-bold text-white">
				$ {marketCapUSDValue ? formatAsset(marketCapUSDValue) : '0.00 USD'}
			</p>
		</Card>
		<Card class="ml-2 h-32 w-full bg-gray-800">
			<p class="text-gray-400">RAM Supply</p>
			<p class="-mt-8 font-bold text-white">{ramSupply ? formatAsset(ramSupply, 3) : '0 GB'}</p>
		</Card>
	</div>
</div>
