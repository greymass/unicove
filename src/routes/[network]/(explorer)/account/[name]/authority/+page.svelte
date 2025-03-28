<script lang="ts">
	import { PermissionLevel } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { goto } from '$lib/utils';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Card } from '$lib/components/layout/index.js';
	import Account from '$lib/components/elements/account.svelte';
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const isCurrentUser = $derived(
		context.account &&
			context.account.name &&
			data.account &&
			data.account.name &&
			data.account.name.equals(context.account.name)
	);

	async function signin(auth: PermissionLevel) {
		await context.wharf.multisig(auth);
		goto(`/${data.account.network}/account/${auth.actor}`);
	}
</script>

<p>
	The {data.account.name} account has some form of authority assigned to the other accounts listed below.
</p>

{#await data.authorizations then authorizations}
	{#each authorizations.accounts as auth}
		{@const permission = PermissionLevel.from(`${auth.account_name}@${auth.permission_name}`)}
		<Card>
			<div class="flex">
				<div class="flex-1">
					<Account name={auth.account_name} class="h4">
						{permission}
					</Account>
					<p>
						Weight of {auth.weight} and threshold of {auth.threshold}.
					</p>
				</div>
				<div class="flex-end">
					{#if isCurrentUser}
						<Button onclick={() => signin(permission)}>
							Login as {permission}
							<div class="text-xs">
								↳ multisig using {data.account.name}
							</div>
						</Button>
					{/if}
				</div>
			</div>
		</Card>
	{:else}
		<Card>
			<p>No authority assigned.</p>
		</Card>
	{/each}
{/await}
