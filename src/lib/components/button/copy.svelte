<script lang="ts">
	import { getSetting } from '$lib/state/settings.svelte';
	import Copy from 'lucide-svelte/icons/copy';
	import { quadIn, quartOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';

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
</script>

<!-- Styled specifically for the PageHeader component. Will need to change it for more generic use.  -->
<!-- Uses absolute positioning so it can maintain a decent hit slop on mobile without affecting layout -->
{#if 'clipboard' in navigator}
	<button
		onclick={copyToClipboard}
		class="absolute left-full grid size-12 -translate-x-2 translate-y-1 place-items-center gap-2 text-skyBlue-500 hover:text-skyBlue-400 focus-visible:text-skyBlue-400 focus-visible:outline-none active:scale-95"
	>
		<div class="relative">
			<Copy class="size-4 " />
			{#if hint}
				<span
					in:fly={{ x: -20, easing: quartOut, duration: 100 }}
					out:fade={{ easing: quadIn, duration: 200 }}
					class="absolute inset-y-0 left-full translate-x-2 text-xs text-skyBlue-400">Copied!</span
				>
			{/if}
		</div>
	</button>
{/if}
