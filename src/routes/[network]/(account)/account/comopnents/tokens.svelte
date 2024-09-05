<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import { TokenList, TokenState } from '../state.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		transferIntent?: Snippet<[TokenState]>;
		tokenList: TokenList;
	}

	const { transferIntent, tokenList }: Props = $props();
</script>

<div class="flex flex-col">
	<div class="flex items-center justify-end gap-4 p-2">
		<div class="flex flex-1">token</div>
		<div class="flex flex-1 justify-end">balance</div>
		<div class="flex flex-1 justify-end">price</div>
		<div class="flex flex-1 justify-end">value</div>
		<div class="flex flex-1 justify-end"></div>
	</div>
	<div>
		{#snippet row(name: string, state: TokenState, transferable: boolean = false)}
			<div class="flex items-center justify-end gap-4 p-2 odd:bg-gray-800">
				<div class="flex flex-1 gap-2">
					{#if state.tokenMeta?.logo}
						<img class="h-6 w-6" src={state.tokenMeta?.logo} alt="LOGO" />
					{:else}
						<div class="h-6 w-6 rounded-full bg-slate-300"></div>
					{/if}
					<span>{name}</span>
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
				</div>
			</div>
		{/snippet}

		{#if tokenList.systemToken}
			{@render row(tokenList.systemToken.asset.symbol.name, tokenList.systemToken, true)}
		{/if}
		{#if tokenList.delegated}
			{@render row(`Staked`, tokenList.delegated, false)}
		{/if}
		{#if tokenList.staked}
			{@render row(`REX`, tokenList.staked, false)}
		{/if}
		{#if tokenList.others}
			{#each tokenList.others as item}
				{@render row(item.asset.symbol.name, item, true)}
			{/each}
		{/if}
	</div>
</div>
