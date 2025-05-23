<script lang="ts">
	import Copy from 'lucide-svelte/icons/copy';
	import { browser } from '$app/environment';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, type ComponentProps } from 'svelte';
	import IconButton from '$lib/components/button/icon.svelte';
	import { ClipboardCheck } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';

	const context = getContext<UnicoveContext>('state');

	interface Props extends Omit<ComponentProps<typeof IconButton>, 'icon'> {
		data: string;
	}

	let props: Props = $props();

	let copied = $state(false);

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(props.data);
			if (context.settings.data.debugMode) console.info(props.data, 'copied to clipboard');
			copied = true;
			setTimeout(() => (copied = false), 500);
		} catch (err) {
			if (context.settings.data.debugMode) console.error('Failed to copy text: ', err);
		}
	}
</script>

{#if browser && 'clipboard' in navigator}
	{#if copied}
		<IconButton icon={ClipboardCheck} {...props} />
	{:else}
		<IconButton label={m.common_copy()} icon={Copy} onclick={copyToClipboard} {...props} />
	{/if}
{/if}
