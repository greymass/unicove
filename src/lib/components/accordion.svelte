<script lang="ts">
	import { cn } from '$lib/utils/style';
	import { ChevronRight } from 'lucide-svelte';
	import { type Snippet } from 'svelte';

	interface AccordionProps {
		class?: string;
		open?: boolean;
		header: () => ReturnType<Snippet>;
		children: Snippet;
	}

	let {
		class: className = 'break-after-avoid',
		open = $bindable(false),
		header,
		children
	}: AccordionProps = $props();

	let detailsElement = $state<HTMLDetailsElement>();

	const syncOpen = () => {
		if (!detailsElement) return;
		if (detailsElement.open) {
			open = true;
		} else {
			open = false;
		}
	};
</script>

<details
	bind:this={detailsElement}
	class={cn('group bg-surface-container rounded-xl', className)}
	{open}
>
	<summary
		class="focus-visible:outline-solar-500 @container flex cursor-pointer justify-between gap-4 rounded-xl p-5 select-none focus-visible:outline"
		onclick={syncOpen}
	>
		<div class="text-muted flex flex-1 flex-wrap justify-between gap-y-4 text-nowrap">
			{@render header()}
		</div>

		<ChevronRight class="text-muted transition-transform duration-100 group-open:rotate-90" />
	</summary>

	<div class="bg-surface-container-low grid grid-cols-[auto_1fr_auto] rounded-b-xl p-5 pt-3">
		{@render children()}
	</div>
</details>
