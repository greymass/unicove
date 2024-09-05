<script lang="ts">
	import { Asset } from '@wharfkit/antelope';

	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { Card, Stack, Switcher } from '$lib/components/layout';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import PageHeader from '$lib/components/pageheader.svelte';

	import * as m from '$lib/paraglide/messages.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { WithdrawState } from './state.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	let withdrawState: WithdrawState = $state(new WithdrawState(data.network));

	$effect(() => {
		withdrawState.sync(data.network, context.account, context.wharf);
	});
</script>

{#if withdrawState.txid}
	<div class="space-y-4">
		<h2 class="h2">Transaction Complete</h2>
		<h3 class="h3">success</h3>
		<p>
			<a href="/{data.network}/transaction/{withdrawState.txid}">
				{withdrawState.txid}
			</a>
		</p>
	</div>
{:else if withdrawState.error}
	<div>
		<h2 class="h2">Transaction Error</h2>
		<p>There was an error submitting your transaction.</p>
	</div>
{:else}
	<Stack class="mx-auto max-w-5xl space-y-8">
		<Switcher>
			<PageHeader title="Currently Withdrawable" subtitle={withdrawState.total} inverted />
			<Button
				disabled={!withdrawState.withdrawable.value}
				onclick={() => withdrawState.transact()}
				variant="secondary"
				class="text-skyBlue-500">Withdraw</Button
			>
		</Switcher>
		<Switcher>
			<Card title="Unstaking Balances">
				<table class="table-auto">
					<thead class="border-b-2 border-shark-100/10">
						<tr class="caption font-medium">
							<th class="p-4 text-left">Amount</th>
							<th class="p-4 text-right">Date available</th>
						</tr>
					</thead>
					<tbody>
						{#each withdrawState.unstaking as record}
							{#if !record.savings}
								<tr>
									<td class="p-4">{record.balance}</td>
									<td class="p-4 text-right"
										>{record.date
											? record.date.toLocaleDateString(undefined, {
													weekday: 'long',
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})
											: '--'}
									</td></tr
								>
							{/if}
						{/each}
					</tbody>
				</table>
			</Card>
		</Switcher>
	</Stack>
{/if}
