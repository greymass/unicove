<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { TokenPriceTicker } from '$lib/state/price-ticker.svelte';
	import { TokenList, TokenState } from './state.svelte';
	import TokenTable from './comopnents/tokens.svelte';
	import type { TokenIdentifier } from '@wharfkit/common';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	let totalSystemTokens: TokenState | undefined = $state();
	const tokenPriceTicker = TokenPriceTicker.INST;
	const tokenList = $state(new TokenList());
	$effect(() => {
		if (context.network && context.account) {
			const key = [String(context.network), String(context.account.name)].join('-');
			if (key !== tokenList.key) {
				totalSystemTokens = undefined;
				tokenList.reset();
			}
			tokenList.setKey(key);
			const price = context.network.tokenprice;
			const metadatas = context.network.tokenmeta;
			const metadata = metadatas && metadatas.length ? metadatas[0] : undefined;
			if (context.account.balance) {
				const balance = context.account.balance;
				totalSystemTokens = TokenState.from(balance.total, metadata, price);
				tokenList.systemToken = balance.liquid.value
					? TokenState.from(balance.liquid, metadata, price)
					: undefined;
				tokenList.delegated = balance.delegated.value
					? TokenState.from(balance.delegated, metadata, price)
					: undefined;
				tokenList.staked = balance.staked.value
					? TokenState.from(balance.staked, metadata, price)
					: undefined;
			}
		} else {
			totalSystemTokens = undefined;
			tokenList.reset();
		}
	});

	$effect(() => {
		if (context.network && context.account) {
			if (context.account.balances) {
				tokenList.others = context.account.balances
					.filter((item) => !item.metadata.id.equals(context.network!.chain.systemToken))
					.map((item) => {
						const price = tokenPriceTicker.getPrice(item.metadata.id);
						return TokenState.from(item.asset, item.metadata, price);
					});
			} else {
				tokenList.others = [];
			}
		}
	});

	$effect(() => {
		if (context.account?.balances && context.network) {
			const tokens: TokenIdentifier[] = [];
			if (context.account.balances) {
				for (const balance of context.account.balances) {
					tokens.push(balance.metadata.id);
				}
			}
			tokenPriceTicker.setTokens(tokens, context.network.chain);
		}
	});

	onMount(() => {
		tokenPriceTicker.startIntervalQuery();
		return () => {
			tokenPriceTicker.stopIntervalQuery();
		};
	});

	let totalUsdValue: number = $derived.by(() => {
		let amount = 0;
		if (totalSystemTokens) {
			amount += totalSystemTokens.value?.value || 0;
		}
		tokenList.others.forEach((item) => {
			amount += item.value?.value || 0;
		});
		return amount;
	});

	const network = $derived(String(data.network));
</script>

<Stack>
	<Pageheader title={context.account?.name} subtitle="Account Overview" />

	<Pageheader title="Tokens" subtitle="Token balances" />
	<Stack>
		<div class="flex rounded-lg bg-slate-600 p-4">
			<div class="flex-1 space-y-3">
				<p>Total {totalSystemTokens?.asset.symbol.name} Balance</p>
				<p>
					{#if totalSystemTokens}{totalSystemTokens.asset.value}
						{totalSystemTokens.asset.symbol.name}
					{:else}
						0
					{/if}
				</p>
			</div>
			<div class="flex-1 space-y-3">
				<p>Total USD Balance</p>
				<p>${totalUsdValue}</p>
			</div>
		</div>
		<TokenTable {tokenList}>
			{#snippet transferIntent(data: TokenState)}
				<div class="flex flex-col">
					<Button class="text-blue-400" variant="pill" href="/{network}/send?quantity={data.asset}"
						>Send</Button
					>
				</div>
			{/snippet}
		</TokenTable>
	</Stack>

	<Pageheader title="Staking" subtitle="Staked balances" />
	<Pageheader title="RAM" subtitle="Information about this account's RAM" />
</Stack>
