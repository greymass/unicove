<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SideMenu from '$lib/components/navigation/sidemenu.svelte';
	import { Menu, Search } from 'lucide-svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		network: NetworkState;
	}

	const { network }: Props = $props();

	let innerWidth = $state(0);

	function closeMenu() {
		$open = false;
	}

	$effect(() => {
		if (innerWidth < 768) {
			$open = false;
		}
	});

	const {
		elements: { trigger, overlay, content, portalled },
		states: { open }
	} = createDialog({
		defaultOpen: false,
		forceVisible: true
	});
</script>

<svelte:window bind:innerWidth />

<!-- [@media(any-hover:hover)]:hover:opacity-80 -->

<menu
	class="fixed bottom-0 z-50 flex w-full items-center justify-between justify-items-center bg-shark-950 px-4 py-2 md:hidden"
>
	<button
		class="
		relative
		flex
		h-10
		items-center
		justify-between
		gap-2
		text-nowrap
		rounded-lg
		py-3.5
		text-base
		font-medium
		transition-opacity
		focus:outline-transparent
		focus-visible:outline
		focus-visible:ring-2
		focus-visible:ring-inset
		focus-visible:ring-solar-500
		"
		use:melt={$trigger}
		aria-label="menu-open"
		id="menu-open"
		data-session={!!context.wharf.session}
	>
		<Menu /><span>Menu</span>
	</button>
	<button
		class="
		relative
		flex
		h-10
		items-center
		justify-between
		gap-2
		text-nowrap
		rounded-lg
		py-3.5
		text-base
		font-medium
		transition-opacity
		focus:outline-transparent
		focus-visible:outline
		focus-visible:ring-2
		focus-visible:ring-inset
		focus-visible:ring-solar-500
		"
		aria-label="search-open"
		id="search-open"
	>
		<Search /><span>Search</span>
	</button>
</menu>

{#if $open}
	<div class="md:hidden" use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50 md:bg-transparent"
			transition:fade={{ duration: 150 }}
		></div>
		<div
			use:melt={$content}
			class="
			fixed
			left-0
			top-0
			z-50
			h-svh
			bg-shark-950
			shadow-lg
			focus:outline-none
			md:bg-transparent
			md:shadow-none
			"
			transition:fly={{
				x: -350,
				duration: 300,
				opacity: 1
			}}
		>
			<SideMenu callbackFn={closeMenu} {network} />
		</div>
	</div>
{/if}
