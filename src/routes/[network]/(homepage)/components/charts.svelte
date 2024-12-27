<script lang="ts">
	import { onMount } from 'svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { HistoricalPrice } from '$lib/types';
	import EOSPriceHistory from '$lib/components/chart/eospricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import TextBlock from './text-block.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		ramResponse: Promise<Response>;
		tokenResponse: Promise<Response>;
		network: NetworkState;
	}
	let { ramResponse, tokenResponse, network }: Props = $props();

	let ramPrices: HistoricalPrice[] = $state([]);
	let tokenPrices: HistoricalPrice[] = $state([]);

	onMount(async () => {
		const parsedRamResponse: { date: string; value: number }[] | { error: string } = await (
			await ramResponse
		).json();
		if ('error' in parsedRamResponse && parsedRamResponse.error) {
			throw new Error(String(parsedRamResponse.error));
		} else if (Array.isArray(parsedRamResponse)) {
			ramPrices = parsedRamResponse.map((price: { date: string; value: number }) => ({
				date: new Date(price.date),
				value: Asset.from(price.value / 10000, network.chain.systemToken?.symbol || '0,UNKNOWN')
			}));
		}

		const parsedTokenResponse: { date: string; value: number }[] | { error: string } = await (
			await tokenResponse
		).json();
		if ('error' in parsedTokenResponse && parsedTokenResponse.error) {
			throw new Error(String(parsedTokenResponse.error));
		} else if (Array.isArray(parsedTokenResponse)) {
			tokenPrices = parsedTokenResponse.map((price: { date: string; value: number }) => ({
				date: new Date(price.date),
				value: Asset.from(price.value / 10000, '4,USD')
			}));
		}
	});
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
					title: m.homepage_native_token_title({
						token: network.chain.systemToken?.symbol.name
					}),
					text: m.homepage_native_token_description({
						token: network.chain.systemToken?.symbol.name,
						network: network.chain.name
					}),
					button: {
						text: m.common_get_tokens(),
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
					title: m.homepage_ram_token_title(),
					text: m.homepage_ram_token_description(),
					button: {
						text: m.homepage_ram_token_market({
							token: network.chain.systemToken?.symbol.name
						}),
						href: `${network}/ram`
					}
				}}
			/>
		</Box>
	</Stack>
</section>
