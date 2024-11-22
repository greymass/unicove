<script lang="ts">
	import { Card, Cluster, MultiCard } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import Account from '$lib/components/elements/account.svelte';
	import Key from 'lucide-svelte/icons/key-round';

	let { data } = $props();
</script>

<MultiCard>
	<Card>
		<Cluster class="items-center">
			<picture class="grid size-12 place-items-center rounded-full bg-mineShaft-900">
				<Key />
			</picture>
			<div>
				<!-- TODO: Display publicKey in multiple formats -->
				<p>{data.publicKey}</p>
				<p>{data.publicKey}</p>
			</div>
		</Cluster>
	</Card>
	<Card title={m.accounts_using_public_key()}>
		{#await data.accounts}
			<!-- TODO: Create generic loading component -->
			<p class="text-muted text-center italic">{m.loading_accounts()}</p>
		{:then accounts}
			{#if accounts && accounts.length > 0}
				<Cluster tag="ul">
					{#each accounts as account}
						<li class="flex">
							<Account
								name={account}
								class="h-12 content-center rounded-lg px-4 hover:bg-mineShaft-900 hover:text-mineShaft-50 focus-visible:bg-mineShaft-900 focus-visible:text-mineShaft-50"
							/>
						</li>
					{/each}
				</Cluster>
			{:else}
				<p class="text-muted text-center">{m.no_accounts_found()}</p>
			{/if}
		{:catch error}
			<p class="text-center text-red-600">{m.error_loading_accounts({ error: error.message })}</p>
		{/await}</Card
	>
</MultiCard>
