<script lang="ts">
	import { Checksum256, Name, PublicKey, UInt32 } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import { createDialog, melt, type CreateDialogProps } from '@melt-ui/svelte';
	import TextInput from './text.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { SearchIcon } from 'lucide-svelte';
	import { history } from '$lib/state/search.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import * as Table from '$lib/components/table';

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

	function go() {
		$open = false;
		if (result) {
			goto(result);
			history.push({ result, searchType });
		}
		searchValue = '';
	}

	function goToHistory(url: string) {
		goto(url);
		$open = false;
		searchValue = '';
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
	class="
	relative
	z-50
	inline-flex
	h-10
	items-center
	justify-end
	text-nowrap
	rounded-full
	bg-transparent
	py-3.5
	text-base
	font-medium
	leading-4
	text-white/50
	focus:outline-none
	focus-visible:border-solar-500
	md:border-2
	md:border-mineShaft-600
	md:px-5
	md:py-2
	{className}
	"
>
	<span>Search<span class="hidden md:inline">...</span></span>
	<SearchIcon class="ml-2 size-4 text-inherit" />
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
				<form onsubmit={preventDefault(go)}>
					<input
						type="text"
						bind:this={ref}
						bind:value={searchValue}
						placeholder="Enter an account, transaction, key, or block..."
						{...props}
						class="w-full rounded-lg border-2 border-skyBlue-500 bg-transparent p-4 focus:outline-none"
					/>
				</form>

				{#if history.length}
					<div class="px-2">
						<Table.Root>
							<Table.Head>
								<Table.Header>Type</Table.Header>
								<Table.Header>Location</Table.Header>
							</Table.Head>
							<Table.Body>
								{#each history as item, index}
									<Table.Row
										onclick={() => goToHistory(item.result)}
										active={index === selectedIndex}
									>
										<Table.Cell>{item.searchType}</Table.Cell>
										<Table.Cell class="truncate">{item.result}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}

				<Button variant="secondary" meltAction={close}>Close</Button>
			</Stack>
		</div>
	</div>
{/if}
