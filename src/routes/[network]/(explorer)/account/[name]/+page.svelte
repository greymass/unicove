<script lang="ts">
	import { Stack, Card, MultiCard, Cluster } from '$lib/components/layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import Chip from '$lib/components/chip.svelte';
	import Tokendistribution from '$lib/components/chart/tokendistribution.svelte';
	import { getSetting } from '$lib/state/settings.svelte';
	import ResourceCard from '$lib/components/elements/resourceCard.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Breakdown, BreakdownRow } from '$lib/components/breakdown';

	const advancedMode = getSetting('advanced-mode', false);

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const isCurrentUser = $derived(
		(context.account?.name && data.account.name?.equals(context.account.name)) || false
	);

	const accountValue = $derived(data.account.value?.total);

	const tokenValue = $derived(data.account.value?.systemtoken);
	const tokenPrice = $derived(data.network.tokenprice);
	const tokenAvailable = $derived(data.account.balance?.liquid);
	const tokenRefunding = $derived(data.account.balance?.refunding);
	const tokenStaked = $derived(data.account.balance?.staked);
	const tokenUnstaked = $derived(data.account.balance?.unstaked);
	const tokenDelegated = $derived(data.account.balance?.delegated);
	const tokenTotal = $derived(data.account.balance?.total);

	const ramValue = $derived(data.account.value?.ram);
	const ramTotal = $derived(Asset.fromUnits(data.account.ram?.max, '3,KB'));
	const ramUsed = $derived(Asset.fromUnits(data.account.ram?.used, '3,KB'));
	const ramAvailable = $derived(Asset.fromUnits(data.account.ram?.available, '3,KB'));
	const ramPrice = $derived(data.network.ramprice?.usd);

	const cpuAvailable = $derived(data.account.cpu?.available);
	const netAvailable = $derived(data.account.net?.available);
</script>

<!-- What gets shown on this page if data.account doesn't exist? -->
{#if data.account}
	<MultiCard>
		<Card id="account-value" style="column-span: all;">
			<Cluster class="items-center">
				<picture class="grid size-12 place-items-center rounded-full bg-mineShaft-900">
					<DollarSign />
				</picture>
				<div>
					<p>Total Account Value</p>
					<AssetText class="text-2xl font-bold text-white" variant="full" value={accountValue} />
				</div>
			</Cluster>
		</Card>

		<Card id="eos" title="EOS" class="break-after-avoid">
			<Stack>
				<Stack class="gap-2">
					<h4 class="text-muted text-base leading-none">Value</h4>
					<p class="text-xl font-semibold leading-none text-white">
						<AssetText variant="full" value={tokenValue} />
					</p>
					<Chip>
						<TradingPair value={tokenPrice} />
						<!-- TODO: Percent change -->
					</Chip>
				</Stack>

				<Breakdown {isCurrentUser}>
					<BreakdownRow
						key="Available"
						value={tokenAvailable}
						action={{ text: 'Send', href: `/${data.network}/send`, visible: isCurrentUser }}
					/>

					<BreakdownRow
						key="Staked"
						value={tokenStaked}
						action={{ text: 'Staking', href: `/${data.network}/staking`, visible: isCurrentUser }}
					/>

					{#if tokenUnstaked && tokenUnstaked.value > 0}
						<BreakdownRow
							key="Unstaked"
							value={tokenUnstaked}
							action={{
								text: 'Withdraw',
								href: `/${data.network}/staking/withdraw`,
								visible: isCurrentUser
							}}
						/>
					{/if}

					{#if tokenDelegated && tokenDelegated.value > 0}
						<BreakdownRow
							key="Delegated"
							value={tokenDelegated}
							action={{
								text: 'Reclaim',
								href: `/${data.network}/undelegate`,
								visible: isCurrentUser
							}}
						/>
					{/if}

					{#if tokenRefunding && tokenRefunding.value > 0}
						<BreakdownRow
							key="Refunding"
							value={tokenRefunding}
							action={{ text: 'Claim', href: `/${data.network}/refund`, visible: isCurrentUser }}
						/>
					{/if}

					<BreakdownRow key="Total" value={tokenTotal} />
				</Breakdown>
			</Stack>
		</Card>

		<Card id="ram" title="RAM" class="">
			<Stack>
				<Stack class="gap-2">
					<h4 class="text-muted text-base leading-none">Value</h4>
					<p class="text-xl font-semibold leading-none text-white">
						<AssetText variant="full" value={ramValue} />
					</p>
					<Chip>
						<!-- TODO: Get TradingPair working with RAM  -->
						<span>
							<AssetText value={ramPrice} /> USD/KB
						</span>
						<!-- TODO: Percent change -->
					</Chip>
				</Stack>

				<Breakdown {isCurrentUser}>
					<BreakdownRow
						key="Available"
						value={ramAvailable}
						action={{ text: 'RAM Market', href: `/${data.network}/ram`, visible: isCurrentUser }}
					/>

					<BreakdownRow key="Used" value={ramUsed} />
					<BreakdownRow key="Total" value={ramTotal} />
				</Breakdown>
			</Stack>
		</Card>

		<Tokendistribution data={data.account.value} />

		{#if advancedMode.value}
			<Card title="Resources">
				<div class="flex flex-wrap gap-12 *:flex-1">
					<ResourceCard type="cpu" value={String(cpuAvailable)} vertical />

					<ResourceCard type="net" value={String(netAvailable)} vertical />
				</div>
				{#if isCurrentUser}
					<Button href={`/${data.network}/resources`} variant="secondary">Go to Resources</Button>
				{/if}
			</Card>
		{/if}
	</MultiCard>
{/if}
