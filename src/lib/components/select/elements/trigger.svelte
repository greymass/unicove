<script lang="ts">
	import { cn } from '$lib/utils/style';
	import { type AnyMeltElement, melt } from '@melt-ui/svelte';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { type Snippet } from 'svelte';
	import { type Readable } from 'svelte/store';

	interface Props {
		variant?: 'pill' | 'form';
		id: string;
		children: Snippet;
		open: Readable<boolean>;
		trigger: AnyMeltElement;
		disabled?: boolean;
		class?: string;
	}

	const { trigger, open, class: className = '', ...props }: Props = $props();
</script>

<button
	class={cn(
		'border-mine-600 focus-visible:border-solar-500 flex items-center justify-between gap-2 border-2 bg-transparent pr-3 pl-4 font-medium transition-opacity   hover:opacity-90 focus-visible:outline-hidden data-[variant=form]:h-12 data-[variant=form]:rounded-lg data-[variant=pill]:h-10 data-[variant=pill]:rounded-full',
		props.disabled && 'text-muted border-mine-600/20',
		className
	)}
	data-variant={props.variant}
	use:melt={$trigger}
	aria-label="{props.id}-label"
	id={props.id}
>
	<div class="flex items-center">
		{@render props.children()}
	</div>
	<ChevronDown
		data-open={$open}
		class="size-5 transition-transform duration-100 data-[open=true]:rotate-180"
	/>
</button>
