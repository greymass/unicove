<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Select, { type OptionWithImage } from './select.svelte';
	import type { ChainDefinition } from '@wharfkit/common';
	import type { Checksum256 } from '@wharfkit/antelope';

	// Override the options and selected props to be more specific to the NetworkSelect component
	interface NetworkSelectProps extends Omit<ComponentProps<Select>, 'options' | 'selected'> {
		options: ChainDefinition[];
		selected: ChainDefinition;
	}

	let { selected: _selected = $bindable(), options, ...props }: NetworkSelectProps = $props();

	// Convert the options to the format the Select component expects
	const selectOptions: OptionWithImage<Checksum256>[] = options.map((option: ChainDefinition) => {
		return {
			value: option.id,
			label: option.name,
			image: String(option.getLogo())
		};
	});

	// Create a derived store to get the selected option
	let selectedOption = $state(selectOptions[0]);

	// Sync the selected option with the passed in selected prop
	$effect(() => {
		_selected = options.find((o) => o.id.equals(selectedOption.value)) || options[0];
	});
</script>

<Select
	variant="form"
	bind:selected={selectedOption}
	sameWidth={false}
	options={selectOptions}
	{...props}
/>
