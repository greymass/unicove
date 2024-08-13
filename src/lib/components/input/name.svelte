<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Textinput from './textinput.svelte';
	import { Name } from '@wharfkit/antelope';

	interface NameInputProps extends ComponentProps<Textinput> {
		value: Name;
		valid?: boolean;
		debug?: boolean;
		placeholder?: string;
		errors?: string[];
	}

	let {
		value: _value = $bindable(),
		debug = false,
		placeholder = '',
		valid = $bindable(false),
		errors = $bindable([])
	}: NameInputProps = $props();

	/** The string value bound to the form input */
	let input: string = $state('');

	/** Full Antelope character rules: /^[a-z1-5.]{0,13}$/ */
	const regex = new RegExp(Name.pattern);

	/** Whether or not the input is a valid Name */
	let satisfies = $derived(!!input && regex.test(input));

	/** The encoded Name */
	let name = $derived(Name.from(input));

	/** The default value as placeholder */
	let nullValue = Name.from(placeholder);

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		if (satisfies) {
			_value = name;
		} else {
			_value = nullValue;
		}
	});
</script>

<Textinput
	bind:value={input}
	placeholder={String(nullValue)}
	pattern={String(Name.pattern.source)}
	maxlength={12}
	size={8}
/>

{#if debug}
	<pre>
value: {_value}
valid: {valid}
name: {name}
input: {input}
	</pre>
{/if}
