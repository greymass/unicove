<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import { browser } from '$app/environment';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, type ComponentProps } from 'svelte';
	import {IconButton} from 'unicove-components';
	import { ClipboardCheck } from 'lucide-svelte';

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
			setTimeout(() => (hint = false), 500);
		} catch (err) {
			if (context.settings.data.debugMode) console.error('Failed to copy text: ', err);
		}
	}
</script>

{#if browser && 'clipboard' in navigator}
	{#if hint}
		<IconButton icon={ClipboardCheck} {...props} />
	{:else}
		<IconButton icon={Copy} onclick={copyToClipboard} {...props} />
	{/if}
{/if}
