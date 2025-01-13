<script lang="ts">
	import { TokenBalance } from '@wharfkit/common';
	import { createSelect, type SelectOption } from '@melt-ui/svelte';
	import { SelectTrigger, SelectMenu, SelectItem } from './elements';
	import { writable } from 'svelte/store';
	import * as m from '$lib/paraglide/messages';

	interface TokenSelectOption extends SelectOption<number> {
		image?: string;
	}

	interface Props {
		options: TokenBalance[];
		selected: TokenBalance;
		debug?: boolean;
		id: string;
		disabled?: boolean;
		required?: boolean;
		multiple?: boolean;
		sameWidth?: boolean;
		class?: string;
	}

	let {
		selected: _selected = $bindable(),
		id,
		options,
		debug = false,
		disabled = false,
		required = false,
		multiple = false,
		sameWidth = true,
		class: className = ''
	}: Props = $props();

	const variant = 'form';

	const label = (balance: TokenBalance) =>
		`${String(balance.asset.symbol.code)} (${balance.asset.quantity})`;

	const image = (balance: TokenBalance) => balance.metadata.logo;

	const createOption = (balance: TokenBalance, index: number): TokenSelectOption => {
		return {
			value: index,
			label: label(balance),
			image: image(balance)
		};
	};

	// Convert the options to the format of SelectOption<number>
	// Using an index as the value instead of the TokenBalance object
	const balanceOptions: TokenSelectOption[] = options.map((balance: TokenBalance, index) =>
		createOption(balance, index)
	);

	// Create a typed store for the selected option
	let selectedTokenOption = writable<TokenSelectOption>(balanceOptions[0]);

	// Build the select component with the custom store
	const {
		elements: { trigger, menu, option },
		states: { open, selected, selectedLabel },
		helpers: { isSelected }
	} = createSelect({
		selected: selectedTokenOption,
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

	// Get the whole TokenBalance object from the selected option by index
	let selectedTokenBalance = $derived.by(() => options[$selectedTokenOption.value] || options[0]);

	// Get the image from the selected TokenBalance object
	let selectedTokenImage = $derived(image(selectedTokenBalance));

	// Sync the currently selected object with the bound selected prop
	$effect(() => {
		if (selected) {
			_selected = selectedTokenBalance;
		}
	});

	/** Set the value from a parent */
	export function set(balance: TokenBalance | null) {
		if (!balance) {
			_selected = options[0];
		} else {
			_selected = balance;
			const option = balanceOptions.find((o) =>
				TokenBalance.from(options[o.value]).equals(balance)
			);
			if (option) {
				selectedTokenOption.set(option);
			}
		}
	}
</script>

<SelectTrigger {variant} {id} {open} {trigger} class={className}>
	{#if selectedTokenImage}
		<img src={selectedTokenImage} alt={$selectedLabel} class="mr-2 size-5 object-contain" />
	{/if}
	{$selectedLabel || m.common_select_an_option()}
</SelectTrigger>

{#if $open}
	<SelectMenu {id} {variant} {menu} {open}>
		{#each balanceOptions as item}
			<SelectItem {id} {option} {variant} {item} {isSelected} />
		{/each}
	</SelectMenu>
{/if}

{#if debug}
	<h3>Component State</h3>
	<pre>

_selected (store): {JSON.stringify(_selected, null, 2)}
selectedOption (store): {JSON.stringify($selectedTokenOption, null, 2)}
options (store): {JSON.stringify(options, null, 2)}
balanceOptions (store): {JSON.stringify(balanceOptions, null, 2)}
</pre>
{/if}
