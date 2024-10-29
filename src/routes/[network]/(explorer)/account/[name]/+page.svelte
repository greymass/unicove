<script lang="ts">
	import Switcher from '$lib/components/layout/switcher.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import CircleProgress from '$lib/components/circleprogress.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';

	import { Asset } from '@wharfkit/antelope';
	import type { Resource } from '@wharfkit/account';

	const { data } = $props();

	const calSize = (available: number) => {
		let size = 0;
		if (!isNaN(available)) size = available / 1000;
		return Number(size.toFixed(2));
	};

	const calUsagePer = (used: number, max: number) => {
		let percentage = 100;
		if (isNaN(max) || isNaN(used)) {
			percentage = 0;
		} else if (max === 0) {
			percentage = 100;
		} else {
			percentage = (used / max) * 100;
			if (percentage > 100) {
				percentage = 100;
			}
		}
		return Number(percentage.toFixed(1));
	};
</script>

{#if data.account}
	<Stack class="my-4 gap-2">
		<Switcher threshold="30rem" class="items-start justify-center">
			<Card>
				<div class="flex items-center gap-5">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#303338]">
						{#if data.network.tokenmeta && data.network.tokenmeta.length}
							<img class="h-6 w-6" src={data.network.tokenmeta[0].logo} alt="LOGO" />
						{/if}
					</div>
					<Stack class="gap-2">
						<p>{data.account.balance?.total.symbol.name || ''} Balance</p>
						<AssetText class="h3" value={data.account.balance?.total} />
					</Stack>
				</div>
			</Card>

			<Card>
				<div class="flex items-center gap-5">
					<div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#303338]">
						<span class="text-3xl font-light">$</span>
					</div>
					<Stack class="gap-2">
						<p>{data.account.value?.total.symbol.name || ''} Value</p>
						<AssetText class="h3" value={data.account.value?.total} />
					</Stack>
				</div>
			</Card>
		</Switcher>

		{#if data.account.balance}
			<table class="table-styles">
				<thead>
					<tr>
						<th>Token</th>
						<th>Amount</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					{#snippet row(name: string, asset: Asset, usdValue?: Asset)}
						<tr>
							<td>
								{name}
							</td>
							<td>
								<AssetText value={asset} />
							</td>
							<td>
								{#if usdValue && usdValue.value}
									<AssetText value={usdValue} />
								{/if}
							</td>
						</tr>
					{/snippet}
					{#if data.account.balance.liquid}
						{@render row('Available', data.account.balance.liquid, data.account.value?.liquid)}
					{/if}
					{#if data.account.balance.delegated}
						{@render row('Staked', data.account.balance.delegated, data.account.value?.delegated)}
					{/if}
					{#if data.account.balance.staked}
						{@render row('REX', data.account.balance.staked, data.account.value?.staked)}
					{/if}
				</tbody>
			</table>
		{/if}
	</Stack>

	{#if data.network.tokenprice && data.network.chain.systemToken}
		<Stack class="my-4 gap-2">
			<h3 class="h3">Token Price</h3>
			<Card>
				<p>
					$<AssetText value={data.network.tokenprice} />/{data.network.chain.systemToken.symbol
						.name}
				</p>
			</Card>
		</Stack>
	{/if}

	{#if data.network.ramprice}
		<Stack class="my-4 gap-2">
			<h3 class="h3">RAM Price</h3>
			<Card>
				<p>
					<AssetText value={data.network.ramprice.eos} variant="full" />/KB
				</p>
				{#if data.network.ramprice.usd}
					<p>$<AssetText value={data.network.ramprice.usd} />/KB</p>
				{/if}
			</Card>
		</Stack>
	{/if}

	{#if data.account.ram || data.account.cpu || data.account.net}
		{#snippet card(resource: Resource)}
			<Card>
				<div class="flex items-center justify-center gap-4">
					<CircleProgress percentage={calUsagePer(Number(resource.used), Number(resource.max))}>
						<div>icon</div>
					</CircleProgress>
					<Stack class="gap-2">
						<p>{resource.resource}</p>
						<h3 class="h3">
							{calSize(Number(resource.max))}
							{resource.resource == 'cpu' ? 'ms' : 'kb'}
						</h3>
						<p>{calUsagePer(Number(resource.used), Number(resource.max))}% Quota used</p>
					</Stack>
				</div>
			</Card>
		{/snippet}

		<Stack class="my-4 gap-2">
			<h3 class="h3">Resources</h3>

			<Grid itemWidth="270px">
				{#if data.account.ram}
					{@render card(data.account.ram)}
				{/if}
				{#if data.account.cpu}
					{@render card(data.account.cpu)}
				{/if}
				{#if data.account.net}
					{@render card(data.account.net)}
				{/if}
			</Grid>
		</Stack>
	{/if}
{/if}
