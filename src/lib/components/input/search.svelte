<script lang="ts">
	import { Checksum256, Name, PublicKey, UInt32 } from '@wharfkit/antelope';
	import type { ComponentProps } from 'svelte';
	import TextInput from './textinput.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';
	import { preventDefault } from '$lib/utils';
	import { goto } from '$app/navigation';

	interface NameInputProps extends ComponentProps<TextInput> {
		debug?: boolean;
		network: NetworkState;
	}

	let {
		autofocus = false,
		network,
		ref = $bindable(),
		debug = false,
		...props
	}: NameInputProps = $props();

	let searchValue: string = $state('');
	const searchType = $derived.by(() => {
		try {
			PublicKey.from(searchValue);
			return 'key';
		} catch (e) {}
		try {
			Checksum256.from(searchValue);
			return 'transaction';
		} catch (e) {}
		try {
			const name = Name.from(searchValue);
			if (searchValue && String(name) === searchValue) {
				return 'account';
			}
		} catch (e) {}
		try {
			UInt32.from(searchValue);
			return 'block';
		} catch (e) {}
		return 'unknown';
	});

	const result = $derived.by(() => {
		switch (searchType) {
			case 'account':
				return `/${network}/account/${searchValue}`;
			case 'block':
				return `/${network}/block/${searchValue}`;
			case 'key':
				return `/${network}/key/${searchValue}`;
			case 'transaction':
				return `/${network}/transaction/${searchValue}`;
			default:
				return null;
		}
	});

	function go() {
		if (result) {
			goto(result);
		}
	}

	debug &&
		$inspect({
			searchValue,
			searchType,
			result
		});
</script>

<form onsubmit={preventDefault(go)}>
	<TextInput bind:ref placeholder="Search..." bind:value={searchValue} {autofocus} {...props} />
</form>

{#if debug}
	<h3>Component State</h3>
	<pre>
search query:  "{searchValue}"
searchType:     {searchType}
result          {result}
</pre>
{/if}
