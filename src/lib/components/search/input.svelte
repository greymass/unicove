<script lang="ts">
	import { getContext, type ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import type TextInput from '../input/text.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages';
	import {
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
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { SerializedSession } from '@wharfkit/session';

	const context = getContext<UnicoveContext>('state');

	interface NameInputProps extends ComponentProps<typeof TextInput> {
		debug?: boolean;
	}

	let { ref = $bindable(), debug = false, ...props }: NameInputProps = $props();

	let searchValue: string = $state('');
	let selectedIndex: number = $state(0);

	let results: SearchRecord[] = $state(context.history.get());

	$effect(() => {
		if (searchValue) {
			results = search(context, searchValue);
		} else {
			results = context.history.get();
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
				return `/${context.network}/account/${searchValue}`;
			case SearchRecordType.BLOCK:
				return `/${context.network}/block/${searchValue}`;
			case SearchRecordType.KEY:
				return `/${context.network}/key/${searchValue}`;
			case SearchRecordType.TRANSACTION:
				return `/${context.network}/transaction/${searchValue}`;
			case SearchRecordType.PAGE:
				return `/${context.network}/${searchValue}`;
			default:
				console.warn('unknown search type', searchType);
				return null;
		}
	});

	const resetSelectedIndex: CreateDialogProps['onOpenChange'] = ({ next }) => {
		selectedIndex = 0;
		return next;
	};

	// Build the dialog element
	const {
		elements: { trigger, portalled, overlay, content },
		states: { open }
	} = createDialog({
		preventScroll: false,
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
				// Select next context.history item
				selectedIndex = (results.length + selectedIndex + 1) % results.length;
				event.preventDefault();
				return;
			}

			if (event.key === 'ArrowUp') {
				if (selectedIndex === undefined) {
					selectedIndex = results.length;
					return;
				}
				// Select previous context.history item
				selectedIndex = (results.length + selectedIndex - 1) % results.length;
				event.preventDefault();
				return;
			}
		}
	}

	async function goToResult() {
		const result = results[selectedIndex];
		if (!result) {
			return;
		}

		// Clear the search history and keep search open, resetting
		if (result.type === SearchRecordType.CLEAR) {
			context.history.clear();
			searchValue = '';
			return;
		}

		closeSearch();

		// Switch accounts if this is a request to switch
		if ([SearchRecordType.SWITCH].includes(result.type)) {
			context.wharf.switch(result.data as SerializedSession);
			// Navigate if needed
			if (!context.settings.data.preventAccountPageSwitching) {
				goto(result.url);
			}
			return;
		}

		// Should this result type be saved in history?
		if (![SearchRecordType.SWITCH, SearchRecordType.UNKNOWN].includes(result.type)) {
			context.history.add(result);
		}

		// Should this result type navigate to the URL?
		if (![SearchRecordType.SWITCH, SearchRecordType.UNKNOWN].includes(result.type)) {
			goto(result.url);
		}
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
		'text-muted focus-visible:ring-solar-500 focus-visible:border-solar-500 md:border-outline md:bg-surface  relative z-50 inline-flex h-10 items-center justify-between rounded-lg py-3.5 text-base leading-4 font-medium text-nowrap focus:outline-hidden focus-visible:ring focus-visible:ring-inset md:justify-between md:border-2  md:py-2 md:pr-0 md:pl-3',
		props.class
	)}
>
	<span class="inline-flex items-center gap-2">
		<SearchIcon class="size-6 text-inherit md:size-5" />
		<span class="hidden md:inline">
			{m.common_search({
				network: String(context.network.chain.name).slice(0, 3)
			})}
		</span>
	</span>

	{#if shortcutKey}
		<span class="border-outline m-2 hidden rounded-sm border px-2 py-1 md:inline">
			{shortcutKey}
		</span>
	{/if}
</button>

{#if $open}
	<div use:melt={$portalled} data-theme={context.network}>
		<div
			use:melt={$overlay}
			class="bg-scrim fixed inset-0 z-50"
			transition:fade={{ duration: 100 }}
		></div>
		<div
			use:melt={$content}
			class="bg-surface-container fixed top-20 left-1/2 z-50 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 transform overflow-hidden rounded-2xl p-4 shadow-lg"
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
							class="border-primary w-full rounded-lg border-2 bg-transparent p-4 focus:outline-hidden"
						/>
						<div class="text-muted absolute inset-y-1 right-4 hidden place-items-center sm:grid">
							<SearchIcon class="size-5 " />
						</div>
					</div>
				</form>

				<div class="table-styles grid grid-cols-[1fr_1fr] gap-x-4 sm:grid-cols-[1fr_1fr_auto]">
					{#if results.length > 0}
						<div class="table-head-styles col-span-full grid grid-cols-subgrid select-none">
							{#if searchValue}
								<span class="pl-2">{m.common_search_results()}</span>
							{:else}
								<span class="pl-2">{m.common_recent_activity()}</span>
							{/if}
							<span class="text-right sm:text-left">{m.common_action()}</span>
							{#if !searchValue}
								<button
									class="focus-visible:outline-solar-500 hidden justify-self-end focus-visible:outline focus-visible:outline-offset-2 sm:block"
									onclick={() => context.history.clear()}
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
						<div class="col-span-full m-4 grid items-center justify-items-center">
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
		class="group/row group-has-[:hover]/list:text-muted hover:group-has-[:hover]/list:bg-surface-container-high hover:group-has-[:hover]/list:text-on-surfac data-[active=true]:bg-surface-container-high data-[active=true]:text-on-surface col-span-full grid h-12 grid-cols-subgrid items-center justify-items-start rounded-lg group-has-[:hover]/list:bg-transparent focus:outline-hidden"
		data-active={active}
	>
		<Result class="col-span-2 sm:col-span-3" {active} record={item} onclick={closeSearch}>
			<div
				data-active={active}
				class="text-on-surface hidden size-12 place-items-center sm:group-hover/row:grid sm:data-[active=true]:grid sm:data-[active=true]:group-has-[:hover]/list:hidden sm:data-[active=true]:group-hover/row:group-has-[:hover]/list:grid"
			>
				<ArrowRight />
			</div>
		</Result>
	</li>
{/snippet}

{#snippet HistoryRow(index: number, item: SearchRecord)}
	{@const active = index === selectedIndex}
	<li
		class="group-has-[:hover]/list:text-muted hover:group-has-[:hover]/list:bg-surface-container-high hover:group-has-[:hover]/list:text-on-surface data-[active=true]:bg-surface-container-high data-[active=true]:text-on-surface col-span-full grid h-12 grid-cols-subgrid items-center justify-items-start rounded-lg group-has-[:hover]/list:bg-transparent focus:outline-hidden"
		data-active={active}
	>
		<Result class="col-span-2 sm:col-span-3" {active} record={item} onclick={closeSearch}>
			<button
				class="text-muted focus-visible:ring-solar-500 hover:text-on-surface grid hidden size-12 place-items-center justify-self-end focus-visible:ring-3 focus-visible:outline-hidden focus-visible:ring-inset sm:block"
				onclick={() => context.history.remove(index)}
			>
				<X class="text-inherit" />
			</button>
		</Result>
	</li>
{/snippet}
