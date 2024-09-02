<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	// Import the TextInput component (assuming it's in a file named TextInput.svelte)
	import TextInput from './text.svelte';

	interface NumberInputProps extends Omit<HTMLInputAttributes, 'type' | 'value'> {
		ref?: HTMLInputElement;
		value?: number;
		min?: number;
		max?: number;
		debug?: boolean;
	}

	let {
		ref = $bindable(),
		value: _value = $bindable(),
		debug = false,
		...props
	}: NumberInputProps = $props();

	let inputValue = $state(String(_value ?? ''));

	let satisfiesMinimum = $derived(inputValue && (!props.min || Number(inputValue) >= props.min));
	let satisfiesMaxmimum = $derived(inputValue && (!props.max || Number(inputValue) <= props.max));
	let satisfies = $derived(satisfiesMinimum && satisfiesMaxmimum);

	$effect(() => {
		if (inputValue && satisfies) {
			_value = Number(inputValue);
		} else {
			_value = undefined;
		}
	});
</script>

<TextInput bind:ref bind:value={inputValue} placeholder="0" type="number" {...props} />

{#if debug}
	<div class="mt-4">
		<h3>Component State</h3>
		<pre>
			Input Value: {inputValue}
			Parsed Value: {_value}
			Satisfies Minimum: {satisfiesMinimum}
			Satisfies Maximum: {satisfiesMaxmimum}
			Satisfies: {satisfies}
			Min: {props.min}
			Max: {props.max}
		</pre>
	</div>
{/if}
