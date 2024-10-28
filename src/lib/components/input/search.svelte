<script lang="ts">
	import { Checksum256, Name, PublicKey, UInt32 } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import TextInput from './text.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { ArrowLeftRight, Box, Key, SearchIcon, UserSearch } from 'lucide-svelte';
	import { history, addHistory } from '$lib/state/search.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import { truncateCenter } from '$lib/utils';
	import { cn } from '$lib/utils';

	interface NameInputProps extends ComponentProps<TextInput> {
		debug?: boolean;
		network: NetworkState;
	}

	let {
		network,
		ref = $bindable(),
		debug = false,
		class: className,
		...props
	}: NameInputProps = $props();

	let searchValue: string = $state('');
	let selectedIndex: number | undefined = $state();

	const searchType = $derived.by(() => {
		/* eslint-disable @typescript-eslint/no-unused-vars */
		/* eslint-disable no-empty */
		try {
			PublicKey.from(searchValue);
			return 'key';
		} catch (e) {}
		try {
			Checksum256.from(searchValue);
			return 'transaction';
		} catch (e) {}
		try {
			const name = Name.from(searchValue);
			if (searchValue && String(name) === searchValue) {
				return 'account';
			}
		} catch (e) {}
		try {
			UInt32.from(searchValue);
			return 'block';
		} catch (e) {}
		return 'unknown';
		/* eslint-enable @typescript-eslint/no-unused-vars */
		/* eslint-enable no-empty */
	});

	const result = $derived.by(() => {
		switch (searchType) {
			case 'account':
				return `/${network}/account/${searchValue}`;
			case 'block':
				return `/${network}/block/${searchValue}`;
			case 'key':
				return `/${network}/key/${searchValue}`;
			case 'transaction':
				return `/${network}/transaction/${searchValue}`;
			default:
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
			if (event.key === 'ArrowDown') {
				if (selectedIndex === undefined) {
					selectedIndex = 0;
					return;
				}
				// Select next history item
				selectedIndex = (history.length + selectedIndex + 1) % history.length;
				return;
			}

			if (event.key === 'ArrowUp') {
				if (selectedIndex === undefined) {
					selectedIndex = history.length;
					return;
				}
				// Select previous history item
				selectedIndex = (history.length + selectedIndex - 1) % history.length;
				return;
			}

			if (selectedIndex !== undefined && event.key === 'Enter') {
				goToHistory(history[selectedIndex].result);
			}
		}
	}

	function goToResult() {
		if (result) {
			goto(result);
			addHistory({ result, searchType, searchValue });
		}
		closeSearch();
	}

	function closeSearch() {
		$open = false;
		searchValue = '';
	}

	function goToHistory(url: string) {
		goto(url);
		closeSearch();
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
		'relative z-50 inline-flex h-10 items-center justify-end text-nowrap rounded-lg bg-transparent py-3.5 text-base font-medium leading-4 text-neutral-400 focus:outline-none focus-visible:border-solar-500 md:justify-between md:border md:border-white/20 md:py-2 md:pl-3 md:pr-2',
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
			class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-mineShaft-950 p-4 shadow-lg"
			transition:scale={{
				duration: 100,
				start: 0.95
			}}
		>
			<Stack>
				<form onsubmit={preventDefault(goToResult)}>
					<div class="relative">
						<input
							type="text"
							bind:this={ref}
							bind:value={searchValue}
							placeholder="Enter an account, transaction, key, or block..."
							{...props}
							class="w-full rounded-lg border-2 border-skyBlue-500 bg-transparent p-4 focus:outline-none"
						/>

						<SearchIcon
							class="absolute right-4 top-1/2 size-5 -translate-y-1/2 outline-none focus:ring-2 focus:ring-skyBlue-500"
						/>
					</div>
					<div class="mt-2 flex gap-2">
						<Button variant="secondary" meltAction={close}>Close</Button>
						<Button variant="primary" type="submit">Search</Button>
					</div>
				</form>

				{#if history.length}
					<div class="px-2">
						<div class="table-styles grid grid-cols-2">
							<div class="table-head-styles col-span-full grid grid-cols-subgrid">
								<span class="pl-2">Recent</span>
								<span>Type</span>
							</div>

							{#each history as item, index}
								<a
									class="table-row-background col-span-full grid grid-cols-subgrid items-center
									justify-items-start border-y border-neutral-300/10
									border-transparent border-b-transparent
									focus:border-skyBlue-500
									focus:outline-none"
									href={item.result}
									onclick={closeSearch}
									data-active={index === selectedIndex}
								>
									<div
										class="table-cell-styles ml-2 flex items-center gap-2 font-mono tabular-nums"
									>
										{#if item.searchType === 'account'}
											<UserSearch class="size-4" />
											<span>{item.searchValue}</span>
										{:else if item.searchType === 'block'}
											<Box class="size-4" />
											<span>{item.searchValue}</span>
										{:else if item.searchType === 'key'}
											<Key class="size-4" />
											<span class="max-w-[12ch] truncate">
												{item.searchValue}
											</span>
										{:else if item.searchType === 'transaction'}
											<ArrowLeftRight class="size-4" />
											<span class="max-w-[13ch] truncate">
												{truncateCenter(item.searchValue)}
											</span>
										{/if}
									</div>

									<span class="align-center text-base font-medium capitalize text-mineShaft-200/60"
										>{item.searchType}</span
									>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</Stack>
		</div>
	</div>
{/if}
