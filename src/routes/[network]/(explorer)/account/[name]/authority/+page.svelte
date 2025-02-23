<script lang="ts">
	import AssetText from '$lib/components/elements/asset.svelte';
	import { API, Asset, PermissionLevel, UInt64 } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { Card } from '$lib/components/layout/index.js';
	import Code from '$lib/components/code.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();
	const zero = UInt64.from(0);
	const balances = $derived(data.account.balances.filter((item) => item.asset.units.gt(zero)));

	const context = getContext<UnicoveContext>('state');
	const isCurrentUser = $derived(
		context.account &&
			context.account.name &&
			data.account &&
			data.account.name &&
			data.account.name.equals(context.account.name)
	);

	function signin(auth: PermissionLevel) {
		context.wharf.multisig(auth);
	}
</script>

{#await data.authorizations then authorizations}
	{#each authorizations.accounts as auth, i}
		{@const permission = PermissionLevel.from(`${auth.account_name}@${auth.permission_name}`)}
		<Card>
			<div class="flex">
				<div class="flex-1">
					<Account name={auth.account_name} class="h2">
						{permission}
					</Account>
					<p>
						Weight of {auth.weight} and threshold of {auth.threshold}.
					</p>
				</div>
				<div class="flex-end">
					{#if isCurrentUser}
						<Button onclick={() => signin(permission)}>Setup Multi-Sig</Button>
					{/if}
				</div>
			</div>
		</Card>
	{/each}
{/await}
