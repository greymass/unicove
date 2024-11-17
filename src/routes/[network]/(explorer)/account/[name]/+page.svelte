<script lang="ts">
	import { Stack, Card, PageColumns, Cluster } from '$lib/components/layout';
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

	const advancedMode = getSetting('advanced-mode', false);

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const isCurrentUser = $derived(
		context.account &&
			context.account.name &&
			data.account &&
			data.account.name &&
			data.account.name.equals(context.account.name)
	);

	const accountValue = $derived(data.account.value?.total);

	const tokenValue = $derived(data.account.value?.systemtoken);
	const tokenPrice = $derived(data.network.tokenprice);
	const tokenAvailable = $derived(data.account.balance?.liquid);
	const tokenRefunding = $derived(data.account.balance?.refunding);
	const tokenStaked = $derived(data.account.balance?.staked);
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

{#snippet tableAction([text, href]: string[])}
	<td class="text-right">
		<a class="text-skyBlue-500 hover:text-skyBlue-400" {href}>{text}</a>
	</td>
{/snippet}

<!-- What gets shown on this page if data.account doesn't exist? -->
{#if data.account}
	<PageColumns>
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

				<Stack class="gap-2">
					<h5 class="h5">Breakdown</h5>
					<table class="table-styles text-muted">
						<tbody>
							<tr>
								<td>Available</td>
								<td class="text-right text-white">
									<AssetText variant="full" value={tokenAvailable} />
								</td>
								{#if isCurrentUser}
									{@render tableAction(['Send', `/${data.network}/send`])}
								{/if}
							</tr>
							<tr>
								<td>Staked</td>
								<td class="text-right text-white">
									<AssetText variant="full" value={tokenStaked} />
								</td>
								{#if isCurrentUser}
									{@render tableAction(['Staking', `/${data.network}/staking`])}
								{/if}
							</tr>
							{#if tokenDelegated && tokenDelegated.value > 0}
								<tr>
									<td>Delegated</td>
									<td class="text-right text-white">
										<AssetText variant="full" value={tokenDelegated} />
									</td>
									{#if isCurrentUser}
										{@render tableAction(['Reclaim', `/${data.network}/undelegate`])}
									{/if}
								</tr>
							{/if}
							{#if tokenRefunding && tokenRefunding.value > 0}
								<tr>
									<td>Refunding</td>
									<td class="text-right text-white">
										<AssetText variant="full" value={tokenRefunding} />
									</td>
									{#if isCurrentUser}
										{@render tableAction(['Claim', `/${data.network}/refund`])}
									{/if}
								</tr>
							{/if}
							<tr class="font-semibold">
								<td>Total</td>
								<td class="text-right text-white">
									<AssetText variant="full" value={tokenTotal} />
								</td>
								{#if isCurrentUser}
									<td></td>
								{/if}
							</tr>
						</tbody>
					</table>
				</Stack>
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

				<Stack class="gap-2">
					<h5 class="h5">Breakdown</h5>
					<table class="table-styles text-muted">
						<tbody>
							<tr>
								<td>Available</td>
								<td class="text-right text-white">
									<AssetText value={ramAvailable} /> KB
								</td>
								{#if isCurrentUser}
									{@render tableAction(['RAM Market', `/${data.network}/ram`])}
								{/if}
							</tr>
							<tr>
								<td>Used</td>
								<td class="text-right text-white">
									<AssetText value={ramUsed} /> KB
								</td>
								{#if isCurrentUser}
									<td></td>
								{/if}
							</tr>
							<tr class="font-semibold">
								<td>Total</td>
								<td class="text-right text-white">
									<AssetText value={ramTotal} /> KB
								</td>
								{#if isCurrentUser}
									<td></td>
								{/if}
							</tr>
						</tbody>
					</table>
				</Stack>
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
	</PageColumns>
{/if}
