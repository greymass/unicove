<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import { ChevronDown } from 'lucide-svelte';

	interface Option {
		href: string;
		text: string;
	}

	interface Props {
		options: Option[];
		class?: string;
	}

	const { options, ...props }: Props = $props();

	let pathWithoutLanguageTag = $derived(page.url.pathname.slice(3));

	let currentOption = $derived(
		options.map((o) => o.href).findLast((h) => pathWithoutLanguageTag.startsWith(h))
	);

	const isCurrent = (href: string) => currentOption === href;

	const {
		elements: { trigger, menu, option },
		states: { selectedLabel, open }
	} = createSelect<string>({
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});
</script>

<menu aria-label="page functions" class={cn('hidden gap-2 overflow-auto lg:flex', props.class)}>
	{#each options as option}
		<li>
			<Button
				variant="pill"
				aria-current={isCurrent(option.href) ? 'page' : undefined}
				href={option.href}
			>
				{option.text}
			</Button>
		</li>
	{/each}
</menu>

<div
	class="border-shark-900 bg-shark-950 focus-visible:border-solar-500 flex flex-col rounded-lg border bg-transparent focus:outline-hidden lg:hidden"
>
	<button
		class="flex h-12 items-center justify-between px-4 text-base font-medium text-white focus:outline-hidden"
		use:melt={$trigger}
		aria-label="Page"
	>
		{$selectedLabel || options[0].text}
		<ChevronDown class="size-5" />
	</button>

	{#if $open}
		<menu
			class="border-shark-900 bg-shark-950 z-50 flex max-h-[300px] flex-col overflow-y-auto rounded-lg border py-2 shadow-sm focus:ring-0!"
			use:melt={$menu}
			transition:fade={{ duration: 150 }}
		>
			{#each options as { href, text }}
				<li class="text-muted flex h-12">
					<a
						class="data-highlighted:bg-mine-950 data-highlighted:text-mine-50 grow content-center rounded-lg px-4 focus:z-10 data-disabled:opacity-50"
						{href}
						aria-current={isCurrent(href) ? 'page' : undefined}
						use:melt={$option({ value: href, label: text })}
					>
						{text}
					</a>
				</li>
			{/each}
		</menu>
	{/if}
</div>
