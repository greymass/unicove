<script lang="ts">
	import type { HistoricalPrice } from '$lib/types';
	import EOSPriceHistory from '$lib/components/chart/eospricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import TextBlock from './text-block.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Box from '$lib/components/layout/box/box.svelte';

	interface Props {
		ramPrices: HistoricalPrice[];
		tokenPrices: HistoricalPrice[];
		network: NetworkState;
	}
	let { ramPrices, tokenPrices, network }: Props = $props();
</script>

<section
	id="charts"
	class="col-span-full grid grid-cols-2 gap-12 @container xl:grid-cols-9 xl:gap-x-4"
>
	<Stack class="col-span-full @3xl:col-span-1 xl:col-span-4">
		{#if tokenPrices.length}
			<EOSPriceHistory data={tokenPrices} />
		{/if}

		<Box>
			<TextBlock
				{...{
					title: `EOS: The Native Token`,
					text: `The ${network.chain.name} network's native token, EOS, can be used for staking rewards, to buy and sell RAM, to pay transaction fees, and more. It is traded on most major exchanges.`,
					button: {
						text: 'Get Tokens',
						href: `${network}/fund`
					}
				}}
			/>
		</Box>
	</Stack>

	<Stack class="col-span-full @3xl:col-span-1 xl:col-span-4 xl:col-start-6">
		{#if ramPrices.length}
			<RamPriceHistory data={ramPrices} />
		{/if}

		<Box>
			<TextBlock
				{...{
					title: `RAM: Tokenized Blockchain Storage`,
					text: `Each unit of RAM ownership represents a portion of the network's total blockchain storage. RAM can be bought and sold directly from the network using the RAM Market.`,
					button: {
						text: 'EOS/RAM Market',
						href: `${network}/ram`
					}
				}}
			/>
		</Box>
	</Stack>
</section>
