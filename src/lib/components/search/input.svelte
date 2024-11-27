<script lang="ts">
	import { type ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import type TextInput from '../input/text.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import {
		RecordStorage,
		SearchRecordType,
		search,
		isSearchBlock,
		type SearchRecord,
		isSearchAccount,
		isSearchKey,
		isSearchTransaction
	} from '$lib/state/search.svelte';
	import SearchIcon from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';
	import { Stack } from '$lib/components/layout';
	import { cn } from '$lib/utils';
	import Result from './result.svelte';
	import { browser } from '$app/environment';
	import { ArrowRight } from 'lucide-svelte';

	interface NameInputProps extends ComponentProps<typeof TextInput> {
		debug?: boolean;
		network: NetworkState;
	}

	let { network, ref = $bindable(), debug = false, class: className }: NameInputProps = $props();

	let searchValue: string = $state('');
	let selectedIndex: number = $state(0);

	const searchHistory = new RecordStorage(network);

	let results: SearchRecord[] = $state(searchHistory.get());

	$effect(() => {
		if (searchValue) {
			results = search(searchValue, network, searchHistory);
		} else {
			results = searchHistory.get();
		}
	});

	const searchType = $derived.by(() => {
		// Priority to determine the type of search
		if (isSearchKey(searchValue)) {
			return SearchRecordType.KEY;
		}
		if (isSearchTransaction(searchValue)) {
			return SearchRecordType.TRANSACTION;
		}
		if (isSearchAccount(searchValue)) {
			return SearchRecordType.ACCOUNT;
		}
		if (isSearchBlock(searchValue)) {
			return SearchRecordType.BLOCK;
		}
		return SearchRecordType.PAGE;
	});

	const result = $derived.by(() => {
		switch (searchType) {
			case SearchRecordType.ACCOUNT:
				return `/${network}/account/${searchValue}`;
			case SearchRecordType.BLOCK:
				return `/${network}/block/${searchValue}`;
			case SearchRecordType.KEY:
				return `/${network}/key/${searchValue}`;
			case SearchRecordType.TRANSACTION:
				return `/${network}/transaction/${searchValue}`;
			case SearchRecordType.PAGE:
				return `/${network}/${searchValue}`;
			default:
				console.log('unknown search type', searchType);
				return null;
		}
	});

	const resetSelectedIndex: CreateDialogProps['onOpenChange'] = ({ next }) => {
		selectedIndex = 0;
		return next;
	};

	// Build the dialog element
	const {
		elements: { trigger, portalled, overlay, content, close },
		states: { open }
	} = createDialog({
		forceVisible: true,
		onOpenChange: resetSelectedIndex
	});

	function handleKeydown(event: KeyboardEvent) {
		// Focus the search input when the user presses '/' outside a text input or 'Cmd+k' anywhere
		if (
			(event.key === '/' &&
				document.activeElement?.tagName !== 'INPUT' &&
				document.activeElement?.tagName !== 'TEXTAREA' &&
				document.activeElement?.getAttribute('contenteditable') !== 'true') ||
			(event.metaKey && event.key === 'k')
		) {
			event.preventDefault();
			$open = true;
			return;
		}

		if (document.activeElement === ref) {
			if (event.metaKey && event.key === 'k') {
				closeSearch();
				return;
			}

			if (event.key === 'ArrowDown') {
				if (selectedIndex === undefined) {
					selectedIndex = 0;
					return;
				}
				// Select next searchHistory item
				selectedIndex = (results.length + selectedIndex + 1) % results.length;
				event.preventDefault();
				return;
			}

			if (event.key === 'ArrowUp') {
				if (selectedIndex === undefined) {
					selectedIndex = results.length;
					return;
				}
				// Select previous searchHistory item
				selectedIndex = (results.length + selectedIndex - 1) % results.length;
				event.preventDefault();
				return;
			}
		}
	}

	function goToResult() {
		const result = results[selectedIndex];
		if (result) {
			searchHistory.add(result);
			goto(result.url);
		}
		closeSearch();
	}

	function closeSearch() {
		$open = false;
		searchValue = '';
	}

	function getShortcutKey(): '⌘ + K' | '/' | undefined {
		if (!browser || !('navigator' in window)) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if ((window.navigator as any).userAgentData) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { platform } = (window.navigator as any).userAgentData;
			if (platform.startsWith('mac')) return '⌘ + K';
		} else {
			// Fallback for older browsers
			if (navigator.userAgent.indexOf('Mac') != -1) return '⌘ + K';
		}

		return '/';
	}

	const shortcutKey = getShortcutKey();

	if (debug) {
		$inspect({
			selectedIndex,
			searchValue,
			searchType,
			result,
			open: $open
		});
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<button
	use:melt={$trigger}
	aria-label="search"
	id="search"
	class={cn(
		'text-muted relative z-50 inline-flex h-10 items-center justify-between text-nowrap rounded-lg bg-transparent py-3.5 text-base font-medium leading-4 focus:outline-none focus-visible:border-solar-500 md:justify-between md:border md:border-mineShaft-600 md:py-2 md:pl-3 md:pr-0',
		className
	)}
>
	<span class="inline-flex items-center gap-2">
		<SearchIcon class="size-6 text-inherit md:size-5" />
		<span class="hidden md:inline"> {m.common_search()} </span>
	</span>

	{#if shortcutKey}
		<span class="m-2 hidden rounded border border-mineShaft-900 px-2 py-1 md:inline">
			{shortcutKey}
		</span>
	{/if}
</button>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 100 }}
		></div>
		<div
			use:melt={$content}
			class="fixed left-1/2 top-20 z-50 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 transform rounded-2xl bg-mineShaft-950 p-4 shadow-lg"
			transition:scale={{
				duration: 100,
				start: 0.95
			}}
		>
			<Stack class="gap-4">
				<form class="flex flex-col gap-2" onsubmit={preventDefault(goToResult)}>
					<div class="relative">
						<input
							type="text"
							autocorrect="off"
							autocomplete="off"
							autocapitalize="off"
							bind:this={ref}
							bind:value={searchValue}
							placeholder={m.common_search_unicove()}
							class="w-full rounded-lg border-2 border-skyBlue-500 bg-transparent p-4 focus:outline-none"
						/>
						<div
							class="text-muted absolute inset-y-1 right-4 hidden place-items-center bg-mineShaft-950 sm:grid"
						>
							<SearchIcon class="size-5 " />
						</div>
					</div>
				</form>

				<div class="table-styles grid grid-cols-[1fr_auto] gap-x-4 sm:grid-cols-[1fr_1fr_auto]">
					{#if results.length > 0}
						<div class="table-head-styles col-span-full grid select-none grid-cols-subgrid">
							{#if searchValue}
								<span class="pl-2">{m.common_search_results()}</span>
							{:else}
								<span class="pl-2">{m.common_recent_activity()}</span>
							{/if}
							<span class="hidden sm:block">{m.common_action()}</span>
							{#if !searchValue}
								<button
									class="justify-self-end focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-solar-500"
									onclick={() => searchHistory.clear()}
								>
									{m.common_clear()}
								</button>
							{/if}
						</div>
					{/if}

					{#if results.length > 0}
						<ul class="group/list col-span-full grid grid-cols-subgrid">
							{#each results as item, index}
								{#if searchValue}
									{@render ResultRow(index, item)}
								{:else}
									{@render HistoryRow(index, item)}
								{/if}
							{/each}
						</ul>
					{:else}
						<!-- No results -->
						<div class="col-span-full m-4 grid h-12 items-center justify-items-center">
							{#if searchValue}
								<span class="text-muted col-span-full text-center">
									{m.common_search_no_results()}
								</span>
							{:else}
								<span class="text-muted col-span-full text-center">
									{m.common_search_instructions()}
								</span>
							{/if}
						</div>
					{/if}
				</div>
			</Stack>
		</div>
	</div>
{/if}

{#snippet ResultRow(index: number, item: SearchRecord)}
	{@const active = index === selectedIndex}
	<li
		class="group/row group-has-[:hover]/list:text-muted col-span-full grid h-12 grid-cols-subgrid items-center justify-items-start rounded-lg focus:outline-none group-has-[:hover]/list:bg-transparent group-has-[:hover]/list:hover:bg-mineShaft-900 group-has-[:hover]/list:hover:text-mineShaft-50 data-[active=true]:bg-mineShaft-900 data-[active=true]:text-mineShaft-50"
		data-active={active}
	>
		<Result class="sm:col-span-3" {active} record={item} onclick={closeSearch}>
			<div
				data-active={active}
				class="hidden size-12 place-items-center text-mineShaft-50 group-hover/row:grid data-[active=true]:grid group-has-[:hover]/list:data-[active=true]:hidden group-has-[:hover]/list:group-hover/row:data-[active=true]:grid"
			>
				<ArrowRight />
			</div>
		</Result>
	</li>
{/snippet}

{#snippet HistoryRow(index: number, item: SearchRecord)}
	{@const active = index === selectedIndex}
	<li
		class="group-has-[:hover]/list:text-muted col-span-full grid h-12 grid-cols-subgrid items-center justify-items-start rounded-lg focus:outline-none group-has-[:hover]/list:bg-transparent group-has-[:hover]/list:hover:bg-mineShaft-900 group-has-[:hover]/list:hover:text-mineShaft-50 data-[active=true]:bg-mineShaft-900 data-[active=true]:text-mineShaft-50"
		data-active={active}
	>
		<Result {active} record={item} onclick={closeSearch} />

		<button
			class="text-muted grid size-12 place-items-center justify-self-end hover:text-white focus-visible:outline-none focus-visible:ring focus-visible:ring-inset focus-visible:ring-solar-500"
			onclick={() => searchHistory.remove(index)}
		>
			<X class="text-inherit" />
		</button>
	</li>
{/snippet}
