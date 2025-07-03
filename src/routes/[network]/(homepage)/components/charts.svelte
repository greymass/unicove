<script lang="ts">
	import { getContext } from 'svelte';
	import TokenPriceHistory from '$lib/components/chart/tokenpricehistory.svelte';
	import RamPriceHistory from '$lib/components/chart/rampricehistory.svelte';
	import TextBlock from './text-block.svelte';
	import {Stack} from 'unicove-components';
	import * as m from '$lib/paraglide/messages';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { ramtoken, systemtoken } from '$lib/wharf/chains';

	const { network } = getContext<UnicoveContext>('state');

	const funding = network.supports('directfunding');
</script>

<section id="charts" class="@container grid grid-cols-2 gap-12 xl:grid-cols-2 xl:gap-x-12">
	<Stack class="col-span-full @3xl:col-span-1">
		<TokenPriceHistory />

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
	</Stack>

	<Stack class="col-span-full @3xl:col-span-1">
		<RamPriceHistory />

		<TextBlock
			{...{
				title: m.homepage_ram_token_title(),
				text: m.homepage_ram_token_description({
					bytes: 1000,
					ramtoken: ramtoken.name,
					systemtoken: systemtoken.name
				}),
				button: {
					text: m.swap_base_quote({
						base: String(network.chain.systemToken?.symbol.name),
						quote: String(ramtoken.name)
					}),
					href: `${network}/swap/${systemtoken.id.url}/${ramtoken.id.url}`
				}
			}}
		/>
	</Stack>
</section>
