<script lang="ts">
	import { PublicKey, type PublicKeyType } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import { TextInput } from 'unicove-components';

	interface PublicKeyInputProps extends ComponentProps<typeof TextInput> {
		optional?: boolean;
		valid?: boolean;
		value: PublicKeyType | undefined;
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
	}: PublicKeyInputProps = $props();

	/** The string value bound to the form input */
	let input: string = $state(_value ? String(_value) : '');

	/** The derived public key from the formatted input */
	const pubkey: PublicKey | undefined = $derived.by(() => {
		try {
			if (!input) return;
			return PublicKey.from(input);
		} catch (e) {
			console.warn(e);
			return;
		}
	});

	/** Validation states */
	const satisfiesPublicKeyMatch = $derived(
		String(pubkey) === input || String(pubkey?.toLegacyString()) === input
	);

	/** Whether or not the input value is valid */
	const satisfies: boolean = $derived(optional || satisfiesPublicKeyMatch);

	/** Set the input value from a parent */
	export function set(publickey: string) {
		input = publickey;
	}

	/** Set the bindable values on form input changes */
	$effect(() => {
		valid = satisfies;
		if (satisfies) {
			_value = pubkey;
		} else {
			_value = undefined;
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
Public Key:        {pubkey}
    
---

Valid Input:       {satisfies}
Valid Public Key:  {satisfiesPublicKeyMatch}
</pre>
{/if}
