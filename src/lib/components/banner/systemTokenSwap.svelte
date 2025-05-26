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
		class="from-primary-container to-primary-container/50 border-outline grid gap-4 rounded-lg border border-2 bg-gradient-to-br p-4 text-center"
	>
		<div class="grid gap-1">
			<a
				class="text-on-primary-container content-center text-xl leading-tight font-semibold text-balance"
				href="https://www.vaulta.com/resources/vaulta-token-swap-a-begins-may-14"
			>
				<span>
					{m.common_system_token_changed({
						network: props.network.chain.name,
						token: props.network.token.name
					})}
				</span>

				<HelpCircle class="mb-0.5 inline size-4" />
			</a>

			<p class="text-on-primary-container/80 text-sm leading-tight text-balance">
				<AssetText
					variant="full"
					value={props.account.getBalance(props.network.config.legacytoken).balance}
				/>
				{m.common_balance_available_to_swap()}
			</p>
		</div>

		<Button
			class="justify-self-center"
			href="/{props.network}/swap/{props.network.config.legacytoken.id.url}/{props.network.token.id
				.url}"
		>
			{m.common_swap()}
		</Button>
	</aside>
{/if}
