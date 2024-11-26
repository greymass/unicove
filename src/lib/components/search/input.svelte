<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import type TextInput from '../input/text.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
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
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import { cn } from '$lib/utils';
	import Result from './result.svelte';
	import { browser } from '$app/environment';

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

	onMount(() => {
		$open = true;
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

	function getShortcutKey(): 'ctrl' | '⌘' | undefined {
		if (!browser || !('navigator' in window)) {
			return;
		}

		if (navigator.userAgentData) {
			const { platform } = navigator.userAgentData;
			if (platform.startsWith('win')) return 'ctrl';
			if (platform.startsWith('mac')) return '⌘';
			if (platform.startsWith('linux')) return 'ctrl';
		} else {
			// Fallback for older browsers
			const { userAgent } = navigator;
			if (userAgent.indexOf('Win') != -1) return 'ctrl';
			if (userAgent.indexOf('Mac') != -1) return '⌘';
			if (userAgent.indexOf('X11') != -1) return 'ctrl';
			if (userAgent.indexOf('Linux') != -1) return 'ctrl';
		}
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

{#snippet ResultRow(index: number, item: SearchRecord)}
	<div
		class="col-span-full grid h-12 grid-cols-subgrid
items-center justify-items-start
rounded-lg
focus:outline-none
data-[active=true]:ring
data-[active=true]:ring-inset
data-[active=true]:ring-solar-500
"
		data-active={index === selectedIndex}
	>
		<Result record={item} onclick={closeSearch} />

		<button
			class="grid size-12 place-items-center justify-self-end
    focus-visible:outline-none
    focus-visible:ring
    focus-visible:ring-inset
    focus-visible:ring-solar-500
    "
			onclick={() => searchHistory.remove(index)}
		>
			<X class=" text-muted " />
		</button>
	</div>
{/snippet}

<svelte:window on:keydown={handleKeydown} />

<button
	use:melt={$trigger}
	aria-label="search"
	id="search"
	class={cn(
		'text-muted relative z-50 inline-flex h-10 items-center justify-end text-nowrap rounded-lg bg-transparent py-3.5 text-base font-medium leading-4 focus:outline-none focus-visible:border-solar-500 md:justify-between md:border md:border-mineShaft-600 md:py-2 md:pl-3 md:pr-2',
		className
	)}
>
	<SearchIcon class="size-6 text-inherit md:size-5" />
	<span class="hidden md:inline"> Search... </span>
	<span class="hidden md:inline">
		{#if shortcutKey}
			{shortcutKey} + K
		{/if}
	</span>
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
			class="fixed left-1/2 top-8 z-50 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 transform rounded-2xl bg-mineShaft-950 p-4 shadow-lg"
			transition:scale={{
				duration: 100,
				start: 0.95
			}}
		>
			<Stack>
				<form class="flex flex-col gap-4" onsubmit={preventDefault(goToResult)}>
					<div class="relative">
						<input
							type="text"
							autocorrect="off"
							autocomplete="off"
							autocapitalize="off"
							bind:this={ref}
							bind:value={searchValue}
							placeholder="Enter an account, transaction, key, or block..."
							class="w-full rounded-lg border-2 border-skyBlue-500 bg-transparent p-4 focus:outline-none"
						/>

						<div
							class="text-muted absolute inset-y-1 right-4 hidden place-items-center bg-mineShaft-950 sm:grid"
						>
							<SearchIcon class="size-5 " />
						</div>
					</div>

					<div class="flex gap-2">
						<Button variant="secondary" meltAction={close}>Close</Button>
						<Button variant="primary" type="submit">Search</Button>
					</div>
				</form>

				<div class="px-2">
					<div class="table-styles grid grid-cols-[1fr_auto] gap-x-4 sm:grid-cols-[1fr_1fr_auto]">
						<div class="table-head-styles col-span-full grid grid-cols-subgrid">
							{#if searchValue}
								<span class="pl-2">Search Results</span>
							{:else}
								<span class="pl-2">Recent Activity</span>
							{/if}
							<span class="hidden sm:block">Action</span>
							<button class="justify-self-end" onclick={() => searchHistory.clear()}>Clear</button>
						</div>
						{#each results as item, index}
							{@render ResultRow(index, item)}
						{:else}
							<div class="col-span-full grid h-12 items-center justify-items-center">
								<span class="text-muted text-center col-span-full"> No results found </span>
							</div>
						{/each}
					</div>
				</div>
			</Stack>
		</div>
	</div>
{/if}
