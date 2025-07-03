<script lang="ts">
	import { Card, Stack } from 'unicove-components';
	import * as m from '$lib/paraglide/messages.js';
	import Account from '$lib/components/elements/account.svelte';
	import Key from 'lucide-svelte/icons/key-round';
	import { CopyButton } from 'unicove-components';

	let { data } = $props();

	const pubKey = String(data.publicKey);
	const legacyPubKey = data.publicKey.toLegacyString();
</script>

<Stack>
	<Card>
		<div class="flex gap-6">
			<picture
				class="bg-surface-container-high grid size-12 shrink-0 place-items-center rounded-full"
			>
				<Key />
			</picture>
			<div class="space-y-0.5 text-balance *:break-all">
				<p class="text-on-surface font-semibold">
					{pubKey}
					<CopyButton data={pubKey} />
				</p>
				<p class="text-muted">{m.legacy_key()}{': '}{legacyPubKey}</p>
			</div>
		</div>
	</Card>
	<Card title={m.accounts_using_public_key()}>
		{#if data.accounts && data.accounts.length > 0}
			<ul class="layout-grid" style="--grid-itemWidth:20ch;">
				{#each data.accounts as account}
					<li class="flex">
						<Account
							name={account}
							class="hover:bg-surface-container-high hover:text-on-surface h-12 content-center rounded-lg px-4"
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-muted text-center">{m.no_accounts_found()}</p>
		{/if}
	</Card>
</Stack>
