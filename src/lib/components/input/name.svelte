<script lang="ts">
	import { Name } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import TextInput from './text.svelte';

	interface NameInputProps extends ComponentProps<TextInput> {
		valid?: boolean;
		value: Name;
		debug?: boolean;
	}

	let {
		autofocus = false,
		ref = $bindable(),
		valid = $bindable(false),
		value: _value = $bindable(),
		debug = false,
		...props
	}: NameInputProps = $props();

	/** The string value bound to the form input */
	let input: string = $state(String(_value));

	/** The derived name from the formatted input */
	const name: Name = $derived(Name.from(input));

	/** Validation states */
	const satisfiesLength = $derived(String(name).length > 0 && String(name).length <= 12);
	const satisfiesNameMatch = $derived(String(name) === input);

	/** Whether or not the input value is valid */
	const satisfies: boolean = $derived(satisfiesLength && satisfiesNameMatch);

	/** Set the input value from a parent */
	export function set(name: string) {
		input = name;
	}

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		if (satisfies) {
			_value = name;
		} else {
			_value = Name.from('');
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
Name:             {name}
    
---

Valid Input:       {satisfies}
Valid Length:      {satisfiesLength}
Valid Name:        {satisfiesNameMatch}
</pre>
{/if}
