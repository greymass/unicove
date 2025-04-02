<script lang="ts">
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';
	import Code from 'lucide-svelte/icons/code';

	interface Props {
		data: string;
		slop?: boolean;
	}

	let { slop = true, ...props }: Props = $props();

	let buttonSize = $derived(slop ? 'size-12' : 'size-4');
</script>

<!-- Styled as a trailing element. Will need to change it if we want to use it inline with other elements following it.  -->
{#if browser}
	<div
		class="has-focus-visible:text-solar-500 relative inline-flex text-sky-500 hover:text-sky-400 focus-visible:text-sky-400"
	>
		<a
			href={props.data}
			class={cn(
				'peer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-hidden',
				buttonSize
			)}
		>
			<!-- Button is done this way with absolute positioning so we can maintain a decent hit slop on mobile without affecting layout -->
		</a>
		<Code class="pointer-events-none z-50 inline size-4 align-baseline peer-active:scale-95" />
	</div>
{/if}
