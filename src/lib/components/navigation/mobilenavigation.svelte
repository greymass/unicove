<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SideMenuContent from '$lib/components/navigation/sidemenu.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Unicovelogo from '$lib/assets/unicovelogo.svelte';

	const context = getContext<UnicoveContext>('state');

	// Always show the button when hide menu setting is active
	const showMenuButton = $derived(!!context.settings.data.hideSideMenu);

	interface Props {
		network: NetworkState;
		class?: string;
	}

	const { network, class: className = '' }: Props = $props();

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

<button
	class="
	relative
	flex
	h-10
	items-center
	gap-2
	text-nowrap
	rounded-lg
	py-3.5
	text-base
	font-medium
	text-white/50
	transition-opacity
	focus:outline-transparent
	focus-visible:outline
	focus-visible:ring-2
	focus-visible:ring-inset
	focus-visible:ring-solar-500
	md:hidden
	md:data-[show=true]:flex
	{className}
	"
	use:melt={$trigger}
	aria-label="menu-open"
	id="menu-open"
	data-session={!!context.wharf.session}
	data-show={showMenuButton}
>
	<Unicovelogo small />
	<Menu class="size-8 text-inherit" />
</button>

{#if $open}
	<div use:melt={$portalled}>
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		></div>
		<nav
			use:melt={$content}
			class="fixed left-0 top-0 z-50 grid h-svh grid-rows-[auto_1fr] gap-8 bg-shark-950 px-8 pt-4 shadow-lg focus:outline-none"
			transition:fly={{
				x: -350,
				duration: 300,
				opacity: 1
			}}
		>
			<a href="/{network}" onclick={closeMenu} aria-label="Unicove Home">
				<Unicovelogo wordmark />
			</a>
			<SideMenuContent callbackFn={closeMenu} {network} />
		</nav>
	</div>
{/if}
