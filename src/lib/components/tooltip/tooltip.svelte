<script lang="ts">
	import { createTooltip, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { type Snippet } from 'svelte';
	import { type Icon } from 'lucide-svelte';
	import Info from 'lucide-svelte/icons/info';

	interface Props {
		content: string;
		children?: Snippet;
		icon?: typeof Icon;
		fadeDuration?: number;
		openDelay?: number;
		closeDelay?: number;
	}

	const {
		content,
		children,
		icon = Info,
		fadeDuration = 50,
		openDelay = 300,
		closeDelay = 300
	}: Props = $props();

	const {
		elements: { trigger, content: tooltipContent },
		states: { open }
	} = createTooltip({
		openDelay,
		closeDelay
	});
</script>

<span use:melt={$trigger}>
	{#if children}
		{@render children()}
	{/if}
</span>

{#if $open}
	<div
		use:melt={$tooltipContent}
		transition:fade={{ duration: fadeDuration }}
		class="z-50 flex max-w-xs items-center rounded-md border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-white shadow-md"
	>
		{#if icon}
			{@const IconComponent = icon}

			<span class="mr-3">
				<IconComponent size={18} />
			</span>
		{/if}
		<span>{content}</span>
	</div>
{/if}
