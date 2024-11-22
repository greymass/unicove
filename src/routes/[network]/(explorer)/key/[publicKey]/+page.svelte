<script lang="ts">
	import Card from '$lib/components/layout/box/card.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { ArrowRight } from 'lucide-svelte';

	let { data } = $props();
</script>

<Card class="max-w-lg">
	<h4 class="mb-4 text-center">{m.accounts_using_public_key()}:</h4>

	{#await data.accounts}
		<!-- TODO: Generic loading component -->
		<p class="text-muted text-center italic">{m.loading_accounts()}</p>
	{:then accounts}
		{#if accounts && accounts.length > 0}
			<div>
				{#each accounts as account}
					<div
						class="flex flex-wrap items-center justify-between gap-x-4 border-b border-mineShaft-900 py-3 *:grow last:border-none"
					>
						<dt class="caption">{account}</dt>
						<dd class="text-right tabular-nums">
							<a
								href="/{data.network}/account/{account}"
								class="text-skyBlue-500 hover:text-skyBlue-400"
							>
								<span class="inline-flex items-center gap-2">
									{m.account_page()}
									<ArrowRight size={20} />
								</span>
							</a>
						</dd>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-muted text-center">{m.no_accounts_found()}</p>
		{/if}
	{:catch error}
		<p class="text-center text-red-600">{m.error_loading_accounts({ error: error.message })}</p>
	{/await}
</Card>
