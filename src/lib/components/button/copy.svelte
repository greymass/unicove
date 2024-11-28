<script lang="ts">
	import { getSetting } from '$lib/state/settings.svelte';
	import Copy from 'lucide-svelte/icons/copy';
	import { quadIn, quartOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import { browser } from '$app/environment';

	interface Props {
		data: string;
	}

	let { value: debugMode } = getSetting('debug-mode', false);

	let props: Props = $props();

	let hint = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (debugMode) console.log(props.data, 'copied to clipboard');
			hint = true;
			setTimeout(() => (hint = false), 300);
		} catch (err) {
			if (debugMode) console.error('Failed to copy text: ', err);
		}
	}

	let visible = $derived(browser && 'clipboard' in navigator);
</script>

<!-- Styled as a trailing element. Will need to change it if we want to use it inline with other elements following it.  -->
{#if visible}
	<div
		class="relative inline-flex text-skyBlue-500 hover:text-skyBlue-400 focus-visible:text-skyBlue-400 has-[:focus-visible]:text-solar-500"
	>
		<button
			onclick={copyToClipboard}
			class="peer absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none"
			aria-label="Copy"
		>
			<!-- Button is done this way with absolute positioning so we can maintain a decent hit slop on mobile without affecting layout -->
		</button>
		<Copy class="pointer-events-none z-50 inline size-4 align-baseline peer-active:scale-95" />
		{#if hint}
			<span
				in:fly={{ x: -20, easing: quartOut, duration: 100 }}
				out:fade={{ easing: quadIn, duration: 200 }}
				class="absolute inset-y-0 left-full translate-x-2 select-none text-nowrap text-xs text-skyBlue-400"
				>Copied!</span
			>
		{/if}
	</div>
{/if}
