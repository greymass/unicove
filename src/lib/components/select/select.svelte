<script lang="ts">
	import { createSelect, createSync } from '@melt-ui/svelte';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';
	import { SelectTrigger, SelectMenu, SelectItem } from './elements';
	import type { ExtendedSelectOption, SelectOptionVariant } from './types';

	interface Props {
		options: ExtendedSelectOption[];
		selected: ExtendedSelectOption;
		onSelectedChange?: ChangeFn<ExtendedSelectOption | undefined>;
		variant?: SelectOptionVariant;
		id: string;
		required?: boolean;
		disabled?: boolean;
		multiple?: boolean;
		sameWidth?: boolean;
		triggerClass?: string;
		menuClass?: string;
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
		sameWidth = true,
		triggerClass,
		menuClass = ''
	}: Props = $props();

	const {
		elements: { trigger, menu, option },
		states: { open, selected, selectedLabel },
		helpers: { isSelected }
	} = createSelect({
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

	// Sync the selected option with the passed in selected prop
	const sync = createSync({ selected });
	let lastSelected: ExtendedSelectOption | undefined = $state();
	$effect(() => {
		if (JSON.stringify(_selected) !== JSON.stringify(lastSelected)) {
			lastSelected = _selected;
			sync.selected(_selected, (v) => (_selected = v || options[0]));
		}
	});

	// Get the whole option object
	let selectedOption = $derived.by(
		() => options.find((o) => o.label === $selectedLabel) || options[0]
	);
</script>

<SelectTrigger class={triggerClass} {variant} {id} {open} {trigger}>
	{#if selectedOption.image && typeof selectedOption.image === 'string'}
		<img src={selectedOption.image} alt={selectedOption.label} class="mr-2 size-5 object-contain" />
	{/if}
	{$selectedLabel || 'Select an option'}
</SelectTrigger>

{#if $open}
	<SelectMenu class={menuClass} {id} {variant} {menu} {open}>
		{#each options as item}
			<SelectItem {id} {option} {variant} {item} {isSelected} />
		{/each}
	</SelectMenu>
{/if}
