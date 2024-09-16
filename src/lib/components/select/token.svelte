<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { TokenBalance } from '@wharfkit/common';

	import Select, { type CustomSelectOption } from './select.svelte';

	// Override the options and selected props to be more specific to the NetworkSelect component
	interface NetworkSelectProps extends Omit<ComponentProps<Select>, 'options' | 'selected'> {
		options: TokenBalance[];
		selected: TokenBalance;
		debug?: boolean;
	}

	let {
		selected: _selected = $bindable(),
		options,
		debug = false,
		...props
	}: NetworkSelectProps = $props();

	// Convert the options to the format the Select component expects
	const balanceOptions: CustomSelectOption<TokenBalance>[] = $derived.by(() => {
		return options.map((balance: TokenBalance) => {
			return {
				value: balance,
				label: `${String(balance.asset.symbol.code)} (${balance.asset.quantity})`,
				image: balance.metadata.logo
			};
		});
	});

	// Create a derived store to get the selected option
	let selectedOption: CustomSelectOption<TokenBalance> = $state({
		value: _selected,
		label: `${String(_selected.asset.symbol.code)} (${_selected.asset.quantity})`,
		image: _selected.metadata.logo
	});

	/** Set the value from a parent */
	export function set(balance: TokenBalance | null) {
		if (!balance) {
			_selected = balanceOptions[0].value;
		} else {
			_selected = balance;
			const option = balanceOptions.find((o) => TokenBalance.from(o.value).equals(balance));
			if (option) {
				selectedOption = option;
			}
		}
	}

	// Sync the selected option with the passed in selected prop
	$effect(() => {
		const selected = options.find((o) => TokenBalance.from(o).equals(selectedOption.value));
		if (selected) {
			_selected = selected;
		}
	});
</script>

<Select
	variant="form"
	bind:selected={selectedOption}
	sameWidth={false}
	options={balanceOptions}
	{...props}
/>

{#if debug}
	<h3>Component State</h3>
	<pre>

_selected (store): {JSON.stringify(_selected)}
selectedOption (store): {JSON.stringify(selectedOption)}
options (store): {JSON.stringify(options)}
balanceOptions (store): {JSON.stringify(balanceOptions)}
</pre>
{/if}
