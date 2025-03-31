<script lang="ts">
	import { getContext } from 'svelte';
	import TokenPriceHistory from '$lib/components/chart/tokenpricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import TextBlock from './text-block.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Box from '$lib/components/layout/box/box.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const { network } = getContext<UnicoveContext>('state');

	const funding = network.supports('directfunding');
</script>

<section
	id="charts"
	class="@container col-span-full grid grid-cols-2 gap-12 xl:grid-cols-9 xl:gap-x-4"
>
	<Stack class="col-span-full xl:col-span-4 @3xl:col-span-1">
		<TokenPriceHistory />

		<Box>
			<TextBlock
				{...{
					title: m.homepage_native_token_title({
						token: String(network.token.symbol.name)
					}),
					text: m.homepage_native_token_description({
						token: String(network.token.symbol.name),
						network: network.chain.name
					}),
					button: funding
						? {
								text: m.common_get_tokens(),
								href: `${network}/fund`
							}
						: {
								text: m.common_send_tokens({
									token: String(network.token.symbol.name)
								}),
								href: `${network}/send`
							}
				}}
			/>
		</Box>
	</Stack>

	<Stack class="col-span-full xl:col-span-4 xl:col-start-6 @3xl:col-span-1">
		<RamPriceHistory />

		<Box>
			<TextBlock
				{...{
					title: m.homepage_ram_token_title(),
					text: m.homepage_ram_token_description(),
					button: {
						text: m.homepage_ram_token_market({
							token: String(network.chain.systemToken?.symbol.name)
						}),
						href: `${network}/ram`
					}
				}}
			/>
		</Box>
	</Stack>
</section>
