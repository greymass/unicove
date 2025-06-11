<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { getContext } from 'svelte';
	import { Info } from 'lucide-svelte';

	import AssetText from '$lib/components/elements/asset.svelte';
	import TradingPair from '$lib/components/elements/tradingpair.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import {
		TokenBalance,
		tokenEquals,
		TokenHistoricPrice,
		ZeroUnits,
		type TokenPair
	} from '$lib/types/token';
	import * as m from '$lib/paraglide/messages';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Code from '$lib/components/code.svelte';
	import Link from '$lib/components/elements/link.svelte';
	import Accordion from '$lib/components/accordion.svelte';

	const context = getContext<UnicoveContext>('state');

	interface CTA {
		text: string;
		href: string;
		variant?: 'primary' | 'secondary' | 'text' | 'pill';
		visible: boolean;
	}

	interface TokenOverviewProps {
		balance: TokenBalance;
		class?: string;
		child?: string;
		cta?: CTA[];
		debug?: boolean;
		isCurrentUser: boolean;
		open?: boolean;
		network: NetworkState;
		historic?: TokenHistoricPrice;
		historicTimeframe?: string;
		pair?: TokenPair;
		value: Asset;
	}

	let {
		balance: _balance,
		class: className = 'break-after-avoid',
		child,
		cta,
		debug = false,
		isCurrentUser,
		network,
		open = $bindable(false),
		historic,
		historicTimeframe,
		pair,
		value
	}: TokenOverviewProps = $props();

	const balance = $derived(child ? _balance.child(child) : _balance);
	const isRamToken = $derived(tokenEquals(_balance.token.id, network.getRamToken().id));
	const hasValue = $derived(network.supports('delphioracle') || context.settings.data.mockPrice);
	const balanceRefunding = $derived(_balance.child('refunding'));
	const balanceStaked = $derived(_balance.child('staked'));
	const balanceUnstaked = $derived(_balance.child('unstaked'));
	const balanceDelegated = $derived(_balance.child('delegated'));
	const balanceUsed = $derived(_balance.child('used'));
	const balanceWRAM = $derived(_balance.child('wram'));
</script>

{#snippet SubBalance(label: string, value: Asset, action?: { text: string; href: string })}
	<div class="col-span-full grid h-10 grid-cols-subgrid items-center gap-x-4">
		<div class="flex flex-col gap-1">
			{label}
		</div>
		<div class="flex flex-1 flex-col gap-1 text-right text-nowrap">
			<AssetText {value} />
		</div>
		<div class="flex flex-col gap-1 text-nowrap">
			{#if action && isCurrentUser}
				<Button variant="text" href={action.href} class="self-start">
					{action.text}
				</Button>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet AccordionHeader()}
	<!-- Left -->
	<div class="left flex flex-col justify-center gap-2">
		<h4
			class="text-on-surface inline-flex items-center gap-2 text-xl leading-none font-bold capitalize"
		>
			<img
				class="size-6 object-contain"
				alt="{_balance.token.name} Logo"
				src={_balance.token.media?.logo?.light}
			/>
			{#if isRamToken}
				<Link class="text-on-surface" href="/{network}/ram">
					{balance.token.name} (RAM)
				</Link>
			{:else}
				<Link
					class="text-on-surface"
					href="/{network}/token/{balance.token.contract}/{balance.token.name}"
				>
					{balance.token.name}
					<Info class="text-muted size-4" />
				</Link>
			{/if}
		</h4>

		{#if pair && hasValue}
			{#if pair.price.units.gt(ZeroUnits)}
				<TradingPair class="leading-none" {historic} {historicTimeframe} value={pair} />
			{:else}
				<div class="bg-surface-container-high h-4 w-32 animate-pulse rounded">&nbsp;</div>
			{/if}
		{/if}
	</div>

	<!-- Right -->
	<div class="right text-muted flex flex-col justify-between gap-2">
		<div class="h-6 w-full content-center">
			<h4 class="text-on-surface text-right text-xl leading-none font-bold capitalize">
				<AssetText value={balance.balance} />
			</h4>
		</div>

		{#if pair && hasValue}
			{#if value.units.gt(ZeroUnits)}
				<AssetText class="leading-none" variant="full" {value} />
			{:else}
				<div class="bg-surface-container-high max-w-48 animate-pulse rounded-md">&nbsp;</div>
			{/if}
		{/if}
	</div>
{/snippet}

<Accordion class={className} header={AccordionHeader} {open}>
	{@render SubBalance(
		m.common_available(),
		_balance.balance,
		!_balance.locked
			? {
					text: m.common_send(),
					href: `/${network}/send/${balance.token.id.url}`
				}
			: undefined
	)}

	{#if tokenEquals(balance.token.id, network.token.id)}
		{#if network.supports('staking') && balanceStaked}
			{@render SubBalance(m.common_staked(), balanceStaked.balance, {
				text: m.common_staking(),
				href: `/${network}/staking`
			})}
		{/if}

		{#if balanceUnstaked && balanceUnstaked.balance.value > 0}
			{@render SubBalance(m.common_unstaked(), balanceUnstaked.balance, {
				text: m.common_withdraw(),
				href: `/${network}/staking/withdraw`
			})}
		{/if}

		{#if balanceDelegated && balanceDelegated.balance.value > 0}
			{@render SubBalance(m.common_delegated(), balanceDelegated.balance, {
				text: m.common_reclaim(),
				href: `/${network}/undelegate`
			})}
		{/if}

		{#if balanceRefunding && balanceRefunding.balance.value > 0}
			{@render SubBalance(m.common_refunding(), balanceRefunding.balance, {
				text: m.common_claim(),
				href: `/${network}/refund`
			})}
		{/if}
	{/if}

	{#if balanceUsed && balanceUsed.balance.value > 0}
		{@render SubBalance(m.common_used(), balanceUsed.balance)}
	{/if}

	{#if isRamToken && balanceWRAM}
		{@render SubBalance('WRAM', balanceWRAM.balance, {
			text: m.common_swap(),
			href: `/${network}/swap/${balanceWRAM.token.id.url}/${network.getRamToken().id.url}`
		})}
	{/if}

	{#if cta && cta.length}
		<div class="col-span-full flex gap-6">
			{#each cta as action}
				<Button
					class="mt-4 {action.visible ? '' : 'hidden'}"
					variant={action.variant || 'secondary'}
					href={action.href}
				>
					{action.text}
				</Button>
			{/each}
		</div>
	{/if}
</Accordion>

{#if debug}
	<Code json={_balance} />
{/if}
