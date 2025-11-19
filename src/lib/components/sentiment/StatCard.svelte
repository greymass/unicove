<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Component, Snippet } from 'svelte';
	import { Card } from 'unicove-components';

	interface Props {
		label: string;
		icon: Component;
		supports?: boolean | undefined;
		children: Snippet;
	}

	const props: Props = $props();

	const color = $derived.by(() => {
		switch (props.supports) {
			case true:
				return 'text-success';
			case false:
				return 'text-error';
			default:
				return 'text-muted';
		}
	});
</script>

<Card>
	<div class="flex items-center justify-between gap-4">
		{#if props.icon}
			{@const Icon = props.icon}
			<picture
				class="bg-surface-container-high grid size-12 shrink-0 place-items-center rounded-full"
			>
				<Icon class={cn('', color)} />
			</picture>
		{/if}
		<div class="grid gap-2 text-right">
			<p class="text-label-sm">{props.label}</p>
			<span class={cn('*:text-headline', color)}>
				{@render props.children()}
			</span>
		</div>
	</div>
</Card>
