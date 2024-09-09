<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { Box, Card, Center, Stack, Switcher } from '$lib/components/layout';
	import PageHeader from '$lib/components/pageheader.svelte';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';

	import type { UnstakingRecord, WithdrawableBalance } from './utils';
	import { getStakedBalance, getUnstakingBalances, getAPY } from './utils';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();
	const networkName = String(data.network);

	let staked: Asset = $derived(getStakedBalance(data.network, context.account));
	let unstaking: Array<UnstakingRecord> = $derived(
		getUnstakingBalances(data.network, context.account)
	);
	let apy = $derived(getAPY(data.network));
	let usdValue = $derived(
		Asset.from(
			staked.value * (data.network.tokenprice ? data.network.tokenprice.value : 0),
			'4,USD'
		)
	);
</script>

<Stack class="mx-auto max-w-5xl gap-8">
	<Switcher threshold="40rem" class="items-start justify-center">
		<Card class="gap-5">
			<Stack class="gap-0">
				<p class="caption">Currently Staked - {apy}% APY</p>
				<p class="h3">{staked}</p>
				<p class="mt-1.5 self-start rounded bg-shark-800/60 px-2">
					${usdValue}
				</p>
			</Stack>
			<Switcher threshold="20rem">
				<Button href="/{networkName}/staking/stake" variant="secondary" class="text-skyBlue-500"
					>Stake</Button
				>
				<Button href="/{networkName}/staking/unstake" variant="secondary" class="text-skyBlue-500"
					>Unstake</Button
				>
			</Switcher>
		</Card>

		<Card title="Unstaking Balances">
			<table class="table-auto">
				<thead class="border-b-2 border-shark-100/10">
					<tr class="caption font-medium">
						<th class="p-4 text-left">Amount</th>
						<th class="p-4 text-right">Date available</th>
					</tr>
				</thead>
				<tbody>
					{#each unstaking as record}
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
			<Button href="/{networkName}/staking/withdraw" variant="secondary" class="text-skyBlue-500"
				>Withdraw</Button
			>
		</Card>
	</Switcher>
	<Card class="gap-5">
		<Stack class="gap-0">
			<p class="caption">Staking yield history</p>
			<p class="h3">0.0 EOS</p>
		</Stack>
	</Card>
</Stack>
