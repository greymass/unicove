<script lang="ts">
	import { type AnyMeltElement, melt } from '@melt-ui/svelte';
	import { ChevronDown } from 'lucide-svelte';
	import { type Snippet } from 'svelte';
	import { type Readable } from 'svelte/store';

	interface Props {
		variant?: 'pill' | 'form';
		id: string;
		children: Snippet;
		open: Readable<boolean>;
		trigger: AnyMeltElement;
	}

	const { trigger, open, ...props }: Props = $props();
</script>

<button
	class="
	flex
	items-center
	justify-between
	gap-2
	border-2
	border-mineShaft-600
	bg-transparent
	pl-4
	pr-3
	font-medium
	transition-opacity
	hover:opacity-90
	focus:outline-2
	focus:outline-solar-500
	focus-visible:border-transparent
	focus-visible:outline
	data-[variant=pill]:h-10
	data-[variant=form]:rounded-lg
	data-[variant=pill]:rounded-full
	data-[variant=form]:py-4
	"
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
