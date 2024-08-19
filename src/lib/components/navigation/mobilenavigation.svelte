<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SideMenu from '$lib/components/navigation/sidemenu.svelte';

	const context = getContext<UnicoveContext>('state');

	const { network } = $props();

	let innerWidth = $state(0);

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
	class="fixed bottom-0 z-50 grid w-full grid-cols-3 items-center justify-items-center bg-shark-950 md:hidden"
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
		aria-label="account-switcher-label"
		id="account-switcher"
		data-session={!!context.wharf.session}
	>
		Menu
	</button>
	<p>Unicove</p>
	<p>Search</p>
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
			<SideMenu {network} />
		</div>
	</div>
{/if}
