<script lang="ts">
	import { Checksum256, Name, PublicKey, UInt32 } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import { createDialog, melt } from '@melt-ui/svelte';
	import TextInput from './text.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';
	import { fade, scale } from 'svelte/transition';
	import { SearchIcon } from 'lucide-svelte';

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

	const {
		elements: { trigger, portalled, overlay, content, close },
		states: { open }
	} = createDialog({
		forceVisible: true
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
		}
	}

	function go() {
		$open = false;
		if (result) {
			goto(result);
		}
		searchValue = '';
	}

	if (debug) {
		$inspect({
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
			class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-[450px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-mineShaft-950 p-4 shadow-lg"
			transition:scale={{
				duration: 100,
				start: 0.95
			}}
		>
			<form onsubmit={preventDefault(go)}>
				<input
					type="text"
					bind:this={ref}
					bind:value={searchValue}
					placeholder="Search..."
					{...props}
					class="bg-transparent focus:outline-none"
				/>

				<button use:melt={$close}> Close Dialog </button>
			</form>
		</div>
	</div>
{/if}

<!-- {#if debug} -->
<!-- 	<h3>Component State</h3> -->
<!-- 	<pre> -->
<!-- 		search query:  "{searchValue}" -->
<!-- 		searchType:     {searchType} -->
<!-- 		result          {result} -->
<!-- 	</pre> -->
<!-- {/if} -->
