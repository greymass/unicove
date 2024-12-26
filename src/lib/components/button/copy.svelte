<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import { quadIn, quartOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { browser } from '$app/environment';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		data: string;
		slop?: boolean;
	}

	let { slop = true, ...props }: Props = $props();

	let hint = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (context.settings.data.debugMode) console.log(props.data, 'copied to clipboard');
			hint = true;
			setTimeout(() => (hint = false), 300);
		} catch (err) {
			if (context.settings.data.debugMode) console.error('Failed to copy text: ', err);
		}
	}

	let buttonSize = $derived(slop ? 'size-12' : 'size-4');
</script>

<!-- Styled as a trailing element. Will need to change it if we want to use it inline with other elements following it.  -->
{#if browser && 'clipboard' in navigator}
	<div
		class="relative inline-flex text-skyBlue-500 hover:text-skyBlue-400 focus-visible:text-skyBlue-400 has-[:focus-visible]:text-solar-500"
	>
		<button
			onclick={copyToClipboard}
			class={cn(
				'peer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none',
				buttonSize
			)}
			aria-label={m.common_copy()}
		>
			<!-- Button is done this way with absolute positioning so we can maintain a decent hit slop on mobile without affecting layout -->
		</button>
		<Copy class="pointer-events-none z-50 inline size-4 align-baseline peer-active:scale-95" />
		{#if hint}
			<span
				in:fly={{ x: -20, easing: quartOut, duration: 100 }}
				out:fade={{ easing: quadIn, duration: 200 }}
				class="absolute inset-y-0 left-full translate-x-2 select-none text-nowrap text-xs text-skyBlue-400"
				>{m.common_copied_result()}</span
			>
		{/if}
	</div>
{/if}
