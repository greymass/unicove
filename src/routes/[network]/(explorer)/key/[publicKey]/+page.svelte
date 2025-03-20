<script lang="ts">
	import { Card, Grid, Stack } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages.js';
	import Account from '$lib/components/elements/account.svelte';
	import Key from 'lucide-svelte/icons/key-round';
	import CopyButton from '$lib/components/button/copy.svelte';

	let { data } = $props();

	const pubKey = String(data.publicKey);
	const legacyPubKey = data.publicKey.toLegacyString();
</script>

<Stack>
	<Card>
		<div class="flex gap-6">
			<picture class="grid size-12 shrink-0 place-items-center rounded-full bg-mine-shaft-900">
				<Key />
			</picture>
			<div class="space-y-0.5 text-balance *:break-all">
				<p class="font-semibold text-white">
					{pubKey}
					<CopyButton data={pubKey} />
				</p>
				<p class="text-muted">{m.legacy_key()}{': '}{legacyPubKey}</p>
			</div>
		</div>
	</Card>
	<Card title={m.accounts_using_public_key()}>
		{#if data.accounts && data.accounts.length > 0}
			<Grid tag="ul">
				{#each data.accounts as account}
					<li class="flex">
						<Account
							name={account}
							class="h-12 content-center rounded-lg px-4 hover:bg-mine-shaft-900/50  focus-visible:bg-mine-shaft-900 focus-visible:text-mine-shaft-50"
						/>
					</li>
				{/each}
			</Grid>
		{:else}
			<p class="text-muted text-center">{m.no_accounts_found()}</p>
		{/if}
	</Card>
</Stack>
