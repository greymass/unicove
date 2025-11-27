<script lang="ts">
	import type { Icon } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { Card, Stack } from 'unicove-components';
	import ExploreButton from './ExploreButton.svelte';

	export interface ExplorerSectionProps {
		title: string;
		description: string;
		icon: typeof Icon;
		items?: { label: string; href: string; description: string }[];
		children?: Snippet;
	}

	const props: ExplorerSectionProps = $props();
</script>

<Card>
	<Stack class="h-full gap-4">
		<div class="flex items-start gap-4">
			<picture
				class="bg-surface-container-high grid size-12 shrink-0 place-items-center rounded-full"
			>
				{#if props.icon}
					{@const IconComponent = props.icon}
					<IconComponent />
				{/if}
			</picture>
			<div class="space-y-2">
				<h3 class="text-title">{props.title}</h3>
				<p class="text-muted text-label-sm leading-5 text-pretty">{props.description}</p>
			</div>
		</div>

		<svelte:boundary>
			{#snippet pending()}
				<Stack class="flex-1 gap-6">
					{#each { length: 5 }}
						<div
							class="bg-surface-container h-full min-h-4 min-w-32 animate-pulse rounded-md"
						></div>
					{/each}
				</Stack>
			{/snippet}

			{#if props.items}
				<div class="grid gap-3">
					{#each props.items as item}
						<ExploreButton {...item} />
					{/each}
				</div>
			{:else if props.children}
				{@render props.children()}
			{/if}
		</svelte:boundary>
	</Stack>
</Card>
