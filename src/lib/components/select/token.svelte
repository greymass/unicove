<script lang="ts">
	import { TokenBalance } from '@wharfkit/common';

	import Select, { type CustomSelectOption } from './select.svelte';

	// Override the options and selected props to be more specific to the NetworkSelect component
	interface Props {
		options: TokenBalance[];
		selected: TokenBalance;
		debug?: boolean;
	}

	let { selected: _selected = $bindable(), options, debug = false, ...props }: Props = $props();

	// Convert the options to the format the Select component expects
	// Using the index as the value instead of the TokenBalance object
	const balanceOptions: CustomSelectOption<number>[] = $derived.by(() => {
		return options.map((balance: TokenBalance, index) => {
			return {
				value: index,
				label: `${String(balance.asset.symbol.code)} (${balance.asset.quantity})`,
				image: balance.metadata.logo
			};
		});
	});

	// Create a store for the selected option
	let selectedOption: CustomSelectOption<number> = $state({
		value: 0,
		label: `${String(options[0].asset.symbol.code)} (${options[0].asset.quantity})`,
		image: options[0].metadata.logo
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
				selectedOption = option;
			}
		}
	}

	// Sync the selected option with the passed in selected prop
	// mapping the selected option to the index of the options array
	$effect(() => {
		const selected = options[selectedOption.value];
		if (selected) {
			_selected = selected;
		}
	});
</script>

<Select
	id="network-select"
	variant="form"
	bind:selected={selectedOption.value}
	sameWidth={false}
	options={balanceOptions}
	{...props}
/>

{#if debug}
	<h3>Component State</h3>
	<pre>

_selected (store): {JSON.stringify(_selected, null, 2)}
selectedOption (store): {JSON.stringify(selectedOption, null, 2)}
options (store): {JSON.stringify(options, null, 2)}
balanceOptions (store): {JSON.stringify(balanceOptions, null, 2)}
</pre>
{/if}
