<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Grid from '$lib/components/layout/grid.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TokensTable from './components/overview/tokens.svelte';
	import ResourceWrapper from './components/overview/resources.svelte';
	import { Asset } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { TokenList, TokenState } from './state.svelte';

	import { calSize, calUsagePer } from './utils.svelte';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');
	const tokenList = $state(new TokenList());

	const cpuAvailableSize = $derived(calSize(Number(context.account?.cpu?.available)));
	const cpuUsagePerc = $derived(
		calUsagePer(Number(context.account?.cpu?.used), Number(context.account?.cpu?.max))
	);

	const ramAvailableSize = $derived(calSize(Number(context.account?.ram?.available)));
	const ramUsagePerc = $derived(
		calUsagePer(Number(context.account?.ram?.used), Number(context.account?.ram?.max))
	);

	const netAvailableSize = $derived(calSize(Number(context.account?.net?.available)));
	const netUsagePerc = $derived(
		calUsagePer(Number(context.account?.net?.used), Number(context.account?.net?.max))
	);

	$effect(() => {
		if (context.network && context.account) {
			const key = [String(context.network), String(context.account.name)].join('-');
			if (key !== tokenList.key) {
				tokenList.reset();
			}
			tokenList.setKey(key);
			const price = context.network.tokenprice;
			const metadatas = context.network.tokenmeta;
			const metadata = metadatas && metadatas.length ? metadatas[0] : undefined;
			if (context.account.balance) {
				const balance = context.account.balance;
				tokenList.total = TokenState.from(balance.total, metadata, price);
				tokenList.delegated = balance.delegated.value
					? TokenState.from(balance.delegated, metadata, price)
					: undefined;
				if (balance.staked.value) {
					tokenList.systemToken = TokenState.from(balance.liquid, metadata, price);
					tokenList.staked = TokenState.from(balance.staked, metadata, price);
					const rexInfo = context.account.account?.data.rex_info;
					if (rexInfo) {
						tokenList.rexState.matured = context.network.rexToToken(
							Asset.fromUnits(rexInfo.matured_rex, rexInfo.rex_balance.symbol)
						);
						const fiveYearsFromNow = new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 5;
						let savingsBucket = rexInfo.rex_maturities.find(
							(maturity) => +new Date(maturity.first!.toString()) > +fiveYearsFromNow
						);
						let savings = Asset.from(0, rexInfo.rex_balance.symbol);
						if (savingsBucket) {
							savings = context.network.rexToToken(
								Asset.fromUnits(savingsBucket.second, rexInfo.rex_balance.symbol)
							);
						}
						tokenList.rexState.savings = savings;
						if (!tokenList.rexState.fund) {
							context.network.contracts.system
								.table('rexfund')
								.get(context.account.name)
								.then((result) => {
									tokenList.rexState.fund = result ? result.balance : undefined;
								})
								.catch((err) => {});
						}
					}
				} else {
					tokenList.staked = undefined;
					tokenList.rexState.reset();
				}
			}

			if (context.account.balances) {
				tokenList.others = context.account.balances
					.filter((item) => !item.metadata.id.equals(context.network!.chain.systemToken))
					.map((item) => {
						return TokenState.from(item.asset, item.metadata);
					});
			} else {
				tokenList.others = [];
			}
		} else {
			tokenList.reset();
		}
	});

	const network = $derived(String(data.network));
</script>

<h1>Resources</h1>
<br />
<hr />
<br />
<Stack>
	<Grid itemWidth="270px">
		<ResourceWrapper
			title="ram"
			size="{ramAvailableSize}kb"
			used="{ramUsagePerc}% Quota used"
			percentage={ramUsagePerc}
		>
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/ram/buy">BUY</Button>
				<Button class="text-blue-400" variant="pill" href="/{network}/ram/sell">SELL</Button>
			</div>
		</ResourceWrapper>
		<ResourceWrapper
			title="cpu"
			size="{cpuAvailableSize}ms"
			used="{cpuUsagePerc}% Quota used"
			percentage={cpuUsagePerc}
		>
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/cpu">RENT</Button>
			</div>
		</ResourceWrapper>
		<ResourceWrapper
			title="net"
			size="{netAvailableSize}kb"
			used="{netUsagePerc}% Quota used"
			percentage={netUsagePerc}
		>
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/resources/net">RENT</Button>
			</div>
		</ResourceWrapper>
	</Grid>
	<TokensTable {tokenList}>
		{#snippet transferIntent(data: TokenState)}
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/send">Send</Button>
			</div>
		{/snippet}
		{#snippet stakeIntent(data: TokenState)}
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/stake">Stake</Button>
			</div>
		{/snippet}
		{#snippet unstakeIntent(data: Asset)}
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/unstake">Unstake</Button>
			</div>
		{/snippet}

		{#snippet withDrawIntent(data: Asset)}
			<div class="flex flex-col">
				<Button class="text-blue-400" variant="pill" href="/{network}/withdraw">Widthdraw</Button>
			</div>
		{/snippet}
	</TokensTable>
</Stack>

<!-- <Code>{JSON.stringify(context, null, 2)}</Code> -->
