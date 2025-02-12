<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { cn } from '$lib/utils';
	import User from 'lucide-svelte/icons/user';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		data: string;
		slop?: boolean;
	}

	let { slop = true, ...props }: Props = $props();

	function goToContract() {
		goto(`/${props.data}`);
	}

	let buttonSize = $derived(slop ? 'size-12' : 'size-4');
</script>

<!-- Styled as a trailing element. Will need to change it if we want to use it inline with other elements following it.  -->
{#if browser}
	<div
		class="relative inline-flex text-skyBlue-500 hover:text-skyBlue-400 focus-visible:text-skyBlue-400 has-[:focus-visible]:text-solar-500"
	>
		<button
			onclick={goToContract}
			class={cn(
				'peer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none',
				buttonSize
			)}
		>
			<!-- Button is done this way with absolute positioning so we can maintain a decent hit slop on mobile without affecting layout -->
		</button>
		<User class="pointer-events-none z-50 inline size-4 align-baseline peer-active:scale-95" />
	</div>
{/if}
