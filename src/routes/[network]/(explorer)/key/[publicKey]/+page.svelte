<script lang="ts">
	import { Card, Cluster, Grid, MultiCard } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import Account from '$lib/components/elements/account.svelte';
	import Key from 'lucide-svelte/icons/key-round';

	let { data } = $props();

	const pubKey = String(data.publicKey);
	const legacyPubKey = data.publicKey.toLegacyString();
</script>

<MultiCard>
	<Card>
		<Cluster class="items-center">
			<picture class="grid size-12 place-items-center rounded-full bg-mineShaft-900">
				<Key />
			</picture>
			<div class="space-y-px break-all">
				<p class="break-all font-semibold text-white">{pubKey}</p>
				<p class="text-muted break-all">{legacyPubKey}</p>
			</div>
		</Cluster>
	</Card>
	<Card title={m.accounts_using_public_key()}>
		{#await data.accounts}
			<!-- TODO: Create generic loading component -->
			<p class="text-muted text-center italic">{m.loading_accounts()}</p>
		{:then accounts}
			{#if accounts && accounts.length > 0}
				<Grid tag="ul">
					{#each accounts as account}
						<li class="flex">
							<Account
								name={account}
								class="h-12 content-center rounded-lg px-4 hover:bg-mineShaft-900 hover:text-mineShaft-50 focus-visible:bg-mineShaft-900 focus-visible:text-mineShaft-50"
							/>
							<!-- <a href={`/eos/account/${account}`}>{account}</a> -->
						</li>
					{/each}
				</Grid>
			{:else}
				<p class="text-muted text-center">{m.no_accounts_found()}</p>
			{/if}
		{:catch error}
			<p class="text-center text-red-600">{m.error_loading_accounts({ error: error.message })}</p>
		{/await}</Card
	>
</MultiCard>
