<script lang="ts">
	import { PermissionLevel } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { goto } from '$lib/utils';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import {Card} from 'unicove-components';
	import Account from '$lib/components/elements/account.svelte';
	import { Button } from 'unicove-components';

	import * as m from '$lib/paraglide/messages';

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
	{m.common_account_authority_description({
		account: data.account.name
	})}
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
						{m.common_authority_weight_threshold_description({
							weight: auth.weight,
							threshold: auth.threshold
						})}
					</p>
				</div>
				<div class="flex-end">
					{#if isCurrentUser}
						<Button onclick={() => signin(permission)}>
							{m.common_login_as({ permission })}
							<div class="text-xs">
								↳ {m.common_multisig_using({
									account: data.account.name
								})}
							</div>
						</Button>
					{/if}
				</div>
			</div>
		</Card>
	{:else}
		<Card>
			<p>{m.common_no_authorities()}</p>
		</Card>
	{/each}
{/await}
