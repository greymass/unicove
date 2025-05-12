<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { AccountState } from '$lib/state/client/account.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { HelpCircle } from 'lucide-svelte';

	interface Props {
		account?: AccountState;
		network: NetworkState;
	}
	let props: Props = $props();
</script>

{#if props.account && props.network.config.legacytoken && props.account.getBalance(props.network.config.legacytoken)}
	<aside
		class="flex justify-between gap-6 rounded-lg bg-linear-to-r from-[#1C2399] to-[#2E3BFF] p-4 shadow-lg *:row-start-1"
	>
		<div class="xs:gap-1 grid gap-2">
			<a
				class="text-lg leading-tight font-semibold text-balance text-white"
				href="https://www.vaulta.com/resources/vaulta-token-swap-a-begins-may-14"
			>
				{m.common_system_token_changed({
					network: props.network.chain.name,
					token: props.network.token.name
				})}
				<HelpCircle class="inline size-3" />
			</a>

			<p class="text-sm leading-tight text-balance text-white/80">
				<AssetText
					variant="full"
					value={props.account.getBalance(props.network.config.legacytoken).balance}
				/>
				{m.common_balance_available_to_swap()}
			</p>
		</div>

		<Button
			class="grow-0 bg-black/20 text-white "
			href="/{props.network}/swap/{props.network.config.legacytoken.id.url}/{props.network.token.id
				.url}"
		>
			{m.common_swap()}
		</Button>
	</aside>
{/if}
