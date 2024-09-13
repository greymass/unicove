<script lang="ts" context="module">
	export interface OptionWithImage<T = unknown> extends SelectOption<T> {
		image?: string;
	}
</script>

<script lang="ts">
	import { createSelect, createSync, melt, type SelectOption } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';
	import Check from 'lucide-svelte/icons/check';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';

	interface Props {
		options: OptionWithImage<any>[];
		selected: OptionWithImage<any>;
		variant?: 'pill' | 'form';
		id: string;
		onSelectedChange?: ChangeFn<SelectOption | undefined>;
		required?: boolean;
		disabled?: boolean;
		multiple?: boolean;
		sameWidth?: boolean;
	}

	let {
		id,
		options,
		selected: _selected = $bindable(),
		onSelectedChange,
		required,
		disabled,
		variant = 'pill',
		multiple,
		sameWidth = true
	}: Props = $props();

	const {
		elements: { trigger, menu, option },
		states: { open, selected, selectedLabel },
		helpers: { isSelected }
	} = createSelect({
		defaultSelected: _selected || options[0],
		onSelectedChange,
		required,
		disabled,
		multiple,
		forceVisible: true,
		positioning: {
			placement: 'bottom-start',
			fitViewport: true,
			sameWidth
		}
	});

	const sync = createSync({ selected });
	$effect(() => {
		sync.selected(_selected, (v) => (_selected = v || options[0]));
	});

	/** Set the value from a parent */
	export function set(option: OptionWithImage | null) {
		if (!option) {
			_selected = options[0];
		} else {
			_selected = option;
		}
	}

	let selectedOption = $derived.by(() => options.find((o) => o.label === $selectedLabel));
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
	"
	class:rounded-full={variant === 'pill'}
	class:rounded-lg={variant === 'form'}
	class:h-10={variant === 'pill'}
	class:py-4={variant === 'form'}
	use:melt={$trigger}
	aria-label="{id}-label"
	{id}
>
	<div class="flex items-center">
		{#if selectedOption?.image}
			<img
				src={selectedOption.image}
				alt={selectedOption.label}
				class="mr-2 size-5 object-contain"
			/>
		{/if}
		{$selectedLabel || 'Select an option'}
	</div>
	<ChevronDown class="size-5 transition-transform duration-100 {$open ? 'rotate-180' : ''}" />
</button>

{#if $open}
	<div
		class="
		z-10
		flex
		max-h-[300px]
		flex-col
		overflow-y-auto
		border-2
		border-mineShaft-600
		bg-shark-950
		py-1
		shadow
		focus:!ring-0
		"
		class:px-1={variant === 'pill'}
		class:px-2={variant === 'form'}
		class:py-1={variant === 'pill'}
		class:py-2={variant === 'form'}
		class:rounded-2xl={variant === 'pill'}
		class:rounded-lg={variant === 'form'}
		use:melt={$menu}
		transition:fade={{ duration: 100 }}
	>
		{#each options as item}
			<div
				class="
				relative
				grid
				cursor-pointer
				grid-cols-[16px_1fr]
				items-center
				gap-2
				rounded-xl
				px-2
				py-1
				font-medium
				hover:bg-solar-500
				focus:z-10
				focus:text-solar-950
				data-[highlighted]:bg-solar-500
				data-[highlighted]:text-solar-950
				data-[disabled]:opacity-50
				"
				class:rounded-xl={variant === 'pill'}
				class:rounded-sm={variant === 'form'}
				use:melt={$option(item)}
			>
				{#if item.image}
					<img src={item.image} alt={item.label} class="mr-2 size-4 object-contain" />
				{:else}
					<div class="check">
						<Check class="size-4 {$isSelected(item.value) ? 'block' : 'hidden'}" />
					</div>
				{/if}
				{item.label}
			</div>
		{/each}
	</div>
{/if}
