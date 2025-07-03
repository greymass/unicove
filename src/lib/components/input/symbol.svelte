<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import { TextInput } from 'unicove-components';

	interface SymbolInputProps extends ComponentProps<typeof TextInput> {
		optional?: boolean;
		valid?: boolean;
		value: Asset.SymbolType;
		debug?: boolean;
	}

	let {
		autofocus = false,
		optional = false,
		ref = $bindable(),
		valid = $bindable(false),
		value: _value = $bindable(),
		debug = false,
		...props
	}: SymbolInputProps = $props();

	/** The string value bound to the form input */
	let input: string = $state(_value ? String(_value) : '');

	/** The derived symbol from the formatted input */
	const symbol: Asset.Symbol = $derived.by(() => {
		try {
			return Asset.Symbol.from(input);
		} catch (e) {
			console.warn(e);
			return Asset.Symbol.from('0,UNKNOWN');
		}
	});

	/** Validation states */
	const satisfiesLength = $derived(String(symbol).length > 0 && String(symbol).length <= 12);
	const satisfiesSymbolMatch = $derived(String(symbol) === input);

	/** Whether or not the input value is valid */
	const satisfies: boolean = $derived.by(() => {
		try {
			return optional || (satisfiesLength && satisfiesSymbolMatch);
		} catch (e) {
			console.warn(e);
			return false;
		}
	});

	/** Set the input value from a parent */
	export function set(symbol: string) {
		input = symbol;
	}

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		if (satisfies) {
			_value = symbol;
		} else {
			_value = Asset.Symbol.from('0,UNKNOWN');
		}
	});

	if (debug) {
		$inspect({
			input,
			satisfies
		});
	}
</script>

<TextInput bind:ref bind:value={input} {autofocus} {...props} />

{#if debug}
	<h3>Component State</h3>
	<pre>
input (string):   "{input}"
Symbol:            {symbol}
    
---

Valid Input:       {satisfies}
Valid Symbol:      {satisfiesSymbolMatch}
</pre>
{/if}
