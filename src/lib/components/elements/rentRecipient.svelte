<script lang="ts">
	import NameInput from '$lib/components/input/name.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Name } from '@wharfkit/antelope';
	import { preventDefault } from '$lib/utils';

	interface Props {
		valid?: boolean;
		payer: Name;
		receiver: Name;
		debug?: boolean;
	}

	let {
		valid = $bindable(false),
		payer = $bindable(),
		receiver: _receiver = $bindable(),
		debug = false
	}: Props = $props();

	let recipient = $state(Name.from(''));

	let recipientInput: NameInput | undefined = $state();

	let editMode = $state(false);
	function switchNameEdit() {
		editMode = !editMode;
	}

	let recipientValid = $state(true);

	$effect(() => {
		valid = recipientValid;
		if (editMode) {
			if (valid) {
				_receiver = recipient;
			} else {
				_receiver = Name.from('');
			}
		} else {
			_receiver = payer;
		}
	});

	$effect(() => {
		recipientInput?.set(String(payer));
	});
</script>

<fieldset class="grid gap-2">
	<Label for="recipientInput">Receiver</Label>
	{#if !editMode}
		<div class="flex items-center justify-between rounded-lg border-2 border-mineShaft-600 p-4">
			<p class="text-lg font-medium">{payer}</p>
			<p onclick={preventDefault(switchNameEdit)}>edit</p>
		</div>
	{:else}
		<NameInput
			id="recipientInput"
			bind:this={recipientInput}
			bind:value={recipient}
			bind:valid={recipientValid}
			placeholder="Enter the account name of the recipient"
			autofocus
		/>
		{#if !recipientValid}
			<p class="text-red-500">Please enter a valid name</p>
		{/if}
	{/if}
</fieldset>
