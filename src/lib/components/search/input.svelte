<script lang="ts">
	import { Checksum256, Name, PublicKey, UInt32 } from '@wharfkit/antelope';
	import { onMount, type ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import type TextInput from '../input/text.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { RecordStorage, RecordType, search, type Record } from '$lib/state/search.svelte';
	import SearchIcon from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import { cn } from '$lib/utils';
	import Result from './result.svelte';

	interface NameInputProps extends ComponentProps<typeof TextInput> {
		debug?: boolean;
		network: NetworkState;
	}

	let { network, ref = $bindable(), debug = false, class: className }: NameInputProps = $props();

	let searchValue: string = $state('');
	let selectedIndex: number | undefined = $state();

	const searchHistory = new RecordStorage(network);

	let results: Record[] = $state(searchHistory.get());

	$effect(() => {
		if (searchValue) {
			results = search(searchValue, network, searchHistory);
		} else {
			results = searchHistory.get();
		}
	});

	const searchType = $derived.by(() => {
		/* eslint-disable @typescript-eslint/no-unused-vars */
		/* eslint-disable no-empty */
		try {
			PublicKey.from(searchValue);
			return RecordType.KEY;
		} catch (e) {}
		try {
			Checksum256.from(searchValue);
			return RecordType.TRANSACTION;
		} catch (e) {}
		try {
			const name = Name.from(searchValue);
			if (searchValue && String(name) === searchValue) {
				return RecordType.ACCOUNT;
			}
		} catch (e) {}
		try {
			UInt32.from(searchValue);
			return RecordType.BLOCK;
		} catch (e) {}
		return RecordType.PAGE;
		/* eslint-enable @typescript-eslint/no-unused-vars */
		/* eslint-enable no-empty */
	});

	const result = $derived.by(() => {
		switch (searchType) {
			case RecordType.ACCOUNT:
				return `/${network}/account/${searchValue}`;
			case RecordType.BLOCK:
				return `/${network}/block/${searchValue}`;
			case RecordType.KEY:
				return `/${network}/key/${searchValue}`;
			case RecordType.TRANSACTION:
				return `/${network}/transaction/${searchValue}`;
			case RecordType.PAGE:
				return `/${network}/${searchValue}`;
			default:
				console.log('unknown search type', searchType);
				return null;
		}
	});

	const resetSelectedIndex: CreateDialogProps['onOpenChange'] = ({ next }) => {
		if (selectedIndex !== undefined) {
			selectedIndex = undefined;
		}
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
				return;
			}

			if (event.key === 'ArrowUp') {
				if (selectedIndex === undefined) {
					selectedIndex = results.length;
					return;
				}
				// Select previous searchHistory item
				selectedIndex = (results.length + selectedIndex - 1) % results.length;
				return;
			}

			if (selectedIndex !== undefined && event.key === 'Enter') {
				goToSearchHistory(results[selectedIndex]);
				event.preventDefault();
				return;
			}
		}
	}

	function goToResult() {
		if (result) {
			searchHistory.add({ url: result, type: searchType, value: searchValue });
			goto(result);
		}
		closeSearch();
	}

	function closeSearch() {
		$open = false;
		searchValue = '';
	}

	function goToSearchHistory(record: Record) {
		searchHistory.add(record);
		closeSearch();
		goto(record.url);
	}

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
		'text-muted relative z-50 inline-flex h-10 items-center justify-end text-nowrap rounded-lg bg-transparent py-3.5 text-base font-medium leading-4 focus:outline-none focus-visible:border-solar-500 md:justify-between md:border md:border-mineShaft-600 md:py-2 md:pl-3 md:pr-2',
		className
	)}
>
	<span class="hidden md:inline">Search...</span>
	<SearchIcon class="ml-2 size-6 text-inherit md:size-5" />
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
			class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-mineShaft-950 p-4 shadow-lg"
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

				{#if results.length}
					<div class="px-2">
						<div class="table-styles grid grid-cols-[1fr_auto] gap-x-4 sm:grid-cols-[1fr_1fr_auto]">
							<div class="table-head-styles col-span-full grid grid-cols-subgrid">
								{#if searchValue}
									<span class="pl-2">Search Results</span>
								{:else}
									<span class="pl-2">Recent Activity</span>
								{/if}
								<span class="hidden sm:block">Action</span>
								<button class="justify-self-end" onclick={() => searchHistory.clear()}>Clear</button
								>
							</div>

							{#each results as item, index}
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
							{/each}
						</div>
					</div>
				{/if}
			</Stack>
		</div>
	</div>
{/if}
