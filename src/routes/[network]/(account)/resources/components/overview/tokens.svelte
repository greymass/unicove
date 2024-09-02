<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { TokenList, TokenState } from '../../state.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		transferIntent?: Snippet<[TokenState]>;
		stakeIntent?: Snippet<[TokenState]>;
		unstakeIntent?: Snippet<[Asset]>;
		withDrawIntent?: Snippet<[Asset]>;
		tokenList: TokenList;
	}

	const { transferIntent, stakeIntent, unstakeIntent, withDrawIntent, tokenList }: Props = $props();
</script>

{#if tokenList.total}
	<div class="flex flex-col">
		<div class="flex justify-between p-4">
			<div class="rounded-2xl bg-slate-500 p-8">
				{tokenList.total.asset}
			</div>

			<div class="rounded-2xl bg-slate-500 bg-slate-500 p-8">
				{#if tokenList.total.value}
					{tokenList.total.value}
				{/if}
			</div>
		</div>

		<div class="flex items-center justify-end gap-4 p-2">
			<div class="flex flex-1">token</div>
			<div class="flex flex-1 justify-end">amount</div>
			<div class="flex flex-1 justify-end">price</div>
			<div class="flex flex-1 justify-end">value</div>
			<div class="flex flex-1 justify-end"></div>
		</div>
		<div>
			{#snippet balanceRow(
				name: string,
				state: TokenState,
				transferable: boolean = false,
				stakable: boolean = false
			)}
				<div class="flex items-center justify-end gap-4 p-2 odd:bg-gray-800">
					<div class="flex flex-1">
						{#if state.tokenMeta?.logo}
							<img class=" h-6 w-6" src={state.tokenMeta?.logo} alt="LOGO" />
						{/if}
						{name}
					</div>
					<div class="flex flex-1 justify-end">{state.asset.value}</div>
					<div class="flex flex-1 justify-end">{state.price ? `$${state.price.value}` : ''}</div>
					<div class="flex flex-1 justify-end">
						{state.value ? `$${state.value.value}` : ''}
					</div>
					<div class="flex flex-1 justify-end">
						{#if transferable && transferIntent}
							{@render transferIntent(state)}
						{/if}
						{#if stakable && stakeIntent}
							{@render stakeIntent(state)}
						{/if}
					</div>
				</div>
			{/snippet}

			{#snippet rexRow(
				name: string,
				asset: Asset,
				unstakable: boolean = false,
				withdrawable: boolean = false
			)}
				<div class="flex items-center justify-end gap-4 p-2 odd:bg-gray-800">
					<div class="flex flex-1"><p class="pl-8">{name}</p></div>
					<div class="flex flex-1 justify-end">{asset.value}</div>
					<div class="flex flex-1 justify-end"></div>
					<div class="flex flex-1 justify-end"></div>
					<div class="flex flex-1 justify-end">
						{#if unstakable && unstakeIntent}
							{@render unstakeIntent(asset)}
						{/if}
						{#if withdrawable && withDrawIntent}
							{@render withDrawIntent(asset)}
						{/if}
					</div>
				</div>
			{/snippet}

			{#if tokenList.systemToken}
				{@render balanceRow(
					tokenList.systemToken.asset.symbol.name,
					tokenList.systemToken,
					true,
					true
				)}
			{/if}
			{#if tokenList.delegated}
				{@render balanceRow(`Staked`, tokenList.delegated, false, false)}
			{/if}
			{#if tokenList.staked}
				{@render balanceRow(`REX`, tokenList.staked, false)}
				{#if tokenList.rexState}
					{#if tokenList.rexState.savings}
						{@render rexRow(`unstakable`, tokenList.rexState.savings, true, false)}
					{/if}
					{#if tokenList.rexState.withDrawable}
						{@render rexRow('withdrawable', tokenList.rexState.withDrawable, false, true)}
					{/if}
				{/if}
			{/if}
			{#if tokenList.others}
				{#each tokenList.others as item}
					{@render balanceRow(item.asset.symbol.name, item, true, false)}
				{/each}
			{/if}
		</div>
	</div>
{/if}
