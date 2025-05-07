<script lang="ts">
	import { onMount } from 'svelte';
	import X from 'lucide-svelte/icons/x';
	import * as m from '$lib/paraglide/messages';
	import dayjs from 'dayjs';
	import type { AccountState } from '$lib/state/client/account.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import Button from '$lib/components/button/button.svelte';

	interface Props {
		account?: AccountState;
		network: NetworkState;
	}
	let props: Props = $props();
</script>

{#if props.account && props.network.config.legacytoken && props.account.getBalance(props.network.config.legacytoken)}
	<aside
		class="text-on-surface grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-4 rounded-lg bg-linear-to-r from-[#1C2399] to-[#2E3BFF] p-2 pr-4 shadow-lg *:row-start-1"
	>
		<div class="text-on-surface col-start-2 py-4 md:col-span-3 md:col-start-1 md:text-center">
			<p class="text-lg font-semibold">
				Vaulta now uses the {props.network.token.name} token
			</p>
			<p class="text-sm">
				<AssetText
					variant="full"
					value={props.account.getBalance(props.network.config.legacytoken).balance}
				/>
				available to swap.
			</p>
		</div>
		<Button
			href="/{props.network}/swap/{props.network.config.legacytoken.id.url}/{props.network.token.id
				.url}"
		>
			{m.common_swap()}
		</Button>
	</aside>
{/if}
