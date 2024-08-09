<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Cluster, PageMargin, Switcher } from '$lib/components/layout';
	import { chainMapper } from '$lib/wharf/chains';

	const context = getContext<UnicoveContext>('state');
</script>

<PageMargin>
	<Switcher>
		<a href="/">Home</a>

		<Cluster tag="nav" class="justify-end">
			{#if context.account}
				<a href={`/${String(context.account.network)}/account/${context.account.name}`}>
					My Account
				</a>
			{/if}
			<a href="/eos/account/eosio">EOS Account</a>
			<a href="/jungle4/account/eosio">Jungle 4 Account</a>
			<a href="/eos/block/100000">EOS Block</a>
			<a href="/jungle4/block/100000">Jungle 4 Block</a>
		</Cluster>
	</Switcher>
</PageMargin>
