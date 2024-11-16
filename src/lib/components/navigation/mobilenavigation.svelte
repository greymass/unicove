<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import SideMenuContent from '$lib/components/navigation/sidemenu.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import UnicoveLogo from '$lib/assets/unicovelogo.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	const context = getContext<UnicoveContext>('state');

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
	{className}
	"
	use:melt={$trigger}
	aria-label="menu-open"
	id="menu-open"
	data-session={!!context.wharf.session}
>
	<UnicoveLogo small class="size-8 w-min place-self-center" />
	<Menu class="size-8 text-inherit" />
</button>

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
			<SideMenuContent callbackFn={closeMenu} {network} />
		</div>
	</div>
{/if}
