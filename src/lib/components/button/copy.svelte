<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import { browser } from '$app/environment';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, type ComponentProps } from 'svelte';
	import IconButton from '$lib/components/button/icon.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props extends Omit<ComponentProps<typeof IconButton>, 'icon'> {
		data: string;
	}

	let props: Props = $props();

	let hint = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (context.settings.data.debugMode) console.info(props.data, 'copied to clipboard');
			hint = true;
			setTimeout(() => (hint = false), 300);
		} catch (err) {
			if (context.settings.data.debugMode) console.error('Failed to copy text: ', err);
		}
	}
</script>

{#if browser && 'clipboard' in navigator}
	<IconButton icon={Copy} onclick={copyToClipboard} {...props} />
	{#if hint}
		<!-- 		<span -->
		<!-- 			in:fly={{ x: -20, easing: quartOut, duration: 100 }} -->
		<!-- 			out:fade={{ easing: quadIn, duration: 200 }} -->
		<!-- 			class="text-primary absolute inset-y-0 left-full translate-x-2 text-xs text-nowrap select-none" -->
		<!-- 			>{m.common_copied_result()}</span -->
		<!-- 		> -->
	{/if}
{/if}
