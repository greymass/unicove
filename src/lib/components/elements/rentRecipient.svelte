<script lang="ts">
	import NameInput from '$lib/components/input/name.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Name } from '@wharfkit/antelope';
	import { preventDefault } from '$lib/utils';

	interface Props {
		valid?: boolean;
		value: Name;
		debug?: boolean;
	}

	let { valid = $bindable(false), value: _value = $bindable(), debug = false }: Props = $props();

	let recipientInput: NameInput | undefined = $state();

	let nameEditing = $state(false);
	function switchNameEdit() {
		nameEditing = !nameEditing;
	}

	let recipientValid = $state(true);

	let initialAccount = '';
	/** Set the inital name from  parent */
	export function set(name: string) {
		if (initialAccount !== name) {
			initialAccount = name;
		}
	}

	$effect(() => {
		valid = recipientValid;
	});

	$effect(() => {
		recipientInput?.set(initialAccount);
	});
</script>

<fieldset class="grid gap-2">
	<Label for="recipientInput">Receiver</Label>
	{#if !nameEditing}
		<div class="flex items-center justify-between rounded-lg border-2 border-mineShaft-600 p-4">
			<p class="text-lg font-medium">{_value}</p>
			<p onclick={preventDefault(switchNameEdit)}>edit</p>
		</div>
	{:else}
		<NameInput
			id="recipientInput"
			bind:this={recipientInput}
			bind:value={_value}
			bind:valid={recipientValid}
			placeholder="Enter the account name of the recipient"
			autofocus
		/>
		{#if !recipientValid}
			<p class="text-red-500">Please enter a valid name</p>
		{/if}
	{/if}
</fieldset>
