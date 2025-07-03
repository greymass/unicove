<script lang="ts">
	import { ABI, Action, Bytes, Checksum256, Name, Serializer } from '@wharfkit/antelope';
	import Card from '$lib/components/layout/box/card.svelte';
	import {Code} from 'unicove-components';
	import { getContext, onMount } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import NameInput from '$lib/components/input/name.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import {Button} from 'unicove-components';

	import * as m from '$lib/paraglide/messages';
	import { SingleCard } from '$lib/components/layout/index.js';
	import {Stack} from 'unicove-components';
	import Label from '$lib/components/input/label.svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	let accountInput: NameInput | undefined = $state();
	let accountRef: HTMLInputElement | undefined = $state();
	let accountValid = $state(false);
	let accountName: Name = $state(Name.from(''));

	onMount(() => {
		if (data.name) {
			accountName = Name.from(data.name);
			if (accountInput) {
				accountInput?.set(data.name);
			}
		}
	});

	const actions: Action[] = $state([]);
	let id: Checksum256 | undefined = $state();
	let error: string | undefined = $state();

	function set(event: Event) {
		const input = event.target as HTMLInputElement;
		for (const file of input.files || []) {
			const reader = new FileReader();
			const extension = file.name.split('.').pop();
			switch (extension) {
				case 'abi':
					reader.onload = setabi;
					break;
				case 'wasm':
					reader.onload = setcode;
					break;
				default:
					console.error('Unsupported file type');
					return;
			}
			reader.readAsArrayBuffer(file);
		}
	}

	function setabi(this: FileReader) {
		const abi = ABI.from(JSON.parse(new TextDecoder().decode(this.result as ArrayBuffer)));
		actions.push(
			data.network.contracts.system.action('setabi', {
				account: accountName,
				abi: Serializer.encode({ object: abi })
			})
		);
	}

	function setcode(this: FileReader) {
		actions.push(
			data.network.contracts.system.action('setcode', {
				account: accountName,
				code: Bytes.from(this.result as ArrayBuffer),
				vmtype: 0,
				vmversion: 0
			})
		);
	}

	function remove(index: number) {
		actions.splice(index, 1);
	}

	async function transact() {
		context.wharf
			.transact({ actions })
			.then((result) => {
				id = result?.resolved?.transaction.id;
			})
			.catch((err) => {
				error = err.message;
			});
	}
</script>

{#snippet Success()}
	<div class="flex gap-4">
		<Button variant="secondary" onclick={() => (id = undefined)}>{m.common_back()}</Button>
		<Button href={`/${data.network}/account/${context.account?.name}`}>
			{m.common_view_my_account()}
		</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex gap-4">
		<Button onclick={() => (error = undefined)}>{m.common_back()}</Button>
	</div>
{/snippet}

<SingleCard>
	<Stack>
		<TransactForm {id} {error} onsuccess={Success} onfailure={Failure}>
			<p>
				Enter an account name and select an ABI and/or WASM file to upload using the authority of
				the currently logged in account.
			</p>

			<fieldset class="grid gap-2">
				<Label for="account-input">{m.common_account_name()}</Label>
				<NameInput
					autofocus
					bind:this={accountInput}
					bind:ref={accountRef}
					bind:value={accountName}
					bind:valid={accountValid}
					id="account-input"
					placeholder={m.common_account_name()}
				/>
			</fieldset>

			<fieldset class="grid gap-2">
				<Label for="account-input">Contract Files</Label>
				<div
					class="border-outline focus-within:border-primary focus-within:ring-primary relative flex h-12 gap-2 rounded-lg border-2 px-4 *:content-center focus-within:ring-1 focus-within:ring-inset"
				>
					<input
						type="file"
						accept=".abi,.wasm"
						multiple
						onchange={set}
						class="placeholder:text-muted w-full rounded-lg bg-transparent font-medium focus:outline-hidden"
					/>
				</div>
			</fieldset>

			<Button onclick={transact} disabled={actions.length === 0}>Upload</Button>

			{#if actions.length === 0}
				<p class="text-muted">Upload files to generate actions.</p>
			{:else}
				<h3 class="h3">Actions</h3>
				<p>The actions that will be performed are listed below.</p>
				{#each actions as action, index}
					<Card class="mb-4">
						<h4 class="h4">{action.name}</h4>
						<Code json={action} />
						<Button variant="secondary" onclick={() => remove(index)}>Remove Action</Button>
					</Card>
				{/each}
			{/if}
		</TransactForm>
	</Stack>
</SingleCard>
