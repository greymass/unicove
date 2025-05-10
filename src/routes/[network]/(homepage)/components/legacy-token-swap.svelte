<script lang="ts">
	import type { NetworkState } from '$lib/state/network.svelte';
	import Button from '$lib/components/button/button.svelte';

	import * as m from '$lib/paraglide/messages';

	interface Props {
		network: NetworkState;
	}
	let props: Props = $props();
</script>

{#if props.network.config.legacytoken}
	<section class="@container col-span-full grid *:col-span-full *:col-start-1 *:row-start-1">
		<aside
			class="text-on-surface grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-4 rounded-lg bg-linear-to-r from-[#1C2399] to-[#2E3BFF] p-2 pr-4 shadow-lg *:row-start-1"
		>
			<div class="text-on-surface col-start-2 py-4 md:col-span-3 md:col-start-1 md:text-center">
				<p class="text-lg font-semibold text-white">
					{m.common_network_swap_begun({
						network: props.network.chain.name
					})}
				</p>
				<p class="text-sm">
					{m.common_network_swap_description_ratio({
						legacytoken: props.network.config.legacytoken?.name,
						systemtoken: props.network.token.name,
						ratio: '1:1'
					})}
				</p>
			</div>
			<Button
				class="text-white"
				variant="secondary"
				href="https://www.vaulta.com/resources/vaulta-token-swap-a-begins-may-14"
			>
				{m.common_learn_more()}
			</Button>
			<Button
				variant="primary"
				href="/{props.network}/swap/{props.network.config.legacytoken.id.url}/{props.network.token
					.id.url}"
			>
				{m.common_swap_to_token({
					token: props.network.token.name
				})}
			</Button>
		</aside>
	</section>
{/if}
