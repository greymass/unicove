<script lang="ts">
	import XIcon from 'lucide-svelte/icons/x';
	import { getContext } from 'svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import * as m from '$lib/paraglide/messages';
	import PublicKeyInput from '$lib/components/input/publickey.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { i18n } from '$lib/i18n';
	import Select from '$lib/components/select/select.svelte';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import {
		PermissionManager,
		permissionTypeBasic,
		permissionTypeMsig,
		permissionTypeSelects
	} from './manager.svelte.js';
	import type { Checksum256Type } from '@wharfkit/session';
	import type { SelectOption } from '@melt-ui/svelte';
	import type { ExtendedSelectOption } from '$lib/components/select/types.js';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';
	import Code from '$lib/components/code.svelte';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const manager = new PermissionManager({
		context,
		account: data.account,
		permissionName: data.permissionName
	});

	let msigMode: boolean = $state(manager.data.isMsig);
	let permissionTypeSelected: SelectOption = $state(
		manager.data.isMsig ? permissionTypeMsig : permissionTypeBasic
	);

	let transactionId: Checksum256Type | undefined = $state();
	let transactError: string | undefined = $state();

	async function transact() {
		manager
			.transact()
			.then((result) => {
				transactionId = result?.resolved?.transaction.id;
				data.account.refresh();
			})
			.catch((e) => {
				console.error('Transaction error', e);
				transactError = e;
			});
	}

	async function deleteAuth() {
		manager
			.deleteAuth()
			.then((result) => {
				transactionId = result?.resolved?.transaction.id;
				data.account.refresh();
			})
			.catch((e) => {
				console.error('Transaction error', e);
				transactError = e;
			});
	}

	const onPermissionTypeChange: ChangeFn<ExtendedSelectOption | undefined> = ({ next }) => {
		msigMode = next?.value === 'msig';
		return next;
	};
</script>

{#snippet PermissionName()}
	<fieldset class="grid gap-2">
		<Label class="text-xs" for="permission_name">{m.common_permission_name()}</Label>
		<NameInput
			id="permission_name"
			disabled={!manager.newPermission}
			placeholder={m.common_permission_name()}
			bind:value={manager.data.name.value.name}
			bind:valid={manager.data.name.valid.name}
		/>
	</fieldset>
{/snippet}

{#snippet PermissionParent()}
	<fieldset class="grid gap-2">
		<Label class="text-xs" for="permission_parent">Parent Permission</Label>
		<Select
			id="permission_parent"
			disabled={!manager.newPermission}
			options={manager.permissionNames}
			variant="form"
			bind:selected={manager.data.parent}
		/>
	</fieldset>
{/snippet}

{#snippet PermissionType()}
	<fieldset class="grid gap-2">
		<Label class="text-xs" for="permission_type">Permission Type</Label>
		<Select
			id="permission_type"
			onSelectedChange={onPermissionTypeChange}
			options={permissionTypeSelects}
			variant="form"
			bind:selected={permissionTypeSelected}
		/>
	</fieldset>
{/snippet}

{#snippet WaitThreshold()}
	<div class="col-span-full grid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
		<div class="col-span-full space-y-1">
			<h3 class="h4 font-semibold">Weight Threshold</h3>
			<p class="">
				The total weight of all keys, accounts, and waits must be greater than or equal to this
				threshold to approve a transaction.
			</p>
		</div>
		<fieldset class="grid gap-2">
			<Label class="text-xs" for="threshold">{m.common_required()}</Label>
			<NumberInput
				id="threshold"
				min={1}
				placeholder={m.common_permission_threshold()}
				bind:value={manager.data.threshold}
			/>
		</fieldset>
	</div>
{/snippet}

{#snippet KeyAuthInput(index: number)}
	<div class="subgrid">
		<NumberInput
			class={msigMode ? '' : 'hidden'}
			id={`key-${index}-weight`}
			min={1}
			bind:value={manager.data.keys[index].value.weight}
			bind:valid={manager.data.keys[index].valid.weight}
		/>

		<PublicKeyInput
			class="col-span-2"
			id="key-{index}-key"
			placeholder={m.common_public_key()}
			bind:value={manager.data.keys[index].value.key}
			bind:valid={manager.data.keys[index].valid.key}
		/>

		{#if msigMode || index > 0}
			<button
				class="text-muted grid size-12 place-items-center hover:text-white"
				onclick={() => manager.data.removeKey(index)}
			>
				<XIcon class="size-6" />
			</button>
		{/if}
	</div>
{/snippet}

{#snippet KeyAuthDisplay()}
	<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
		<div class="col-span-2 space-y-1">
			<h3 class="h4 font-semibold">Keys Pairs</h3>
			<p class="">Enter the Public Keys which can sign on behalf of this permission.</p>
		</div>
		<div class="col-span-2 space-y-1">
			<Button class="float-right" variant="primary" onclick={manager.data.addKey}>Add Key</Button>
		</div>
		{#if manager.data.keys.length}
			<div class="subgrid gap-2">
				<div class="subgrid">
					{#if msigMode}
						<span>{m.common_permission_weight()}</span>
					{/if}
					<span>{m.common_public_key()}</span>
				</div>
				{#each manager.data.keys as key, index (key)}
					{@render KeyAuthInput(index)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet AccountAuthInput(index: number)}
	{@const state = manager.data.accounts[index]}
	<div class="subgrid">
		<fieldset class="grid gap-2">
			<NumberInput
				min={1}
				placeholder={m.common_permission_weight()}
				bind:value={state.value.weight}
				bind:valid={state.valid.weight}
			/>
		</fieldset>

		<fieldset class="grid gap-2">
			<NameInput
				placeholder={m.common_account()}
				bind:value={state.value.permission.actor}
				bind:valid={state.valid.actor}
			/>
		</fieldset>

		<fieldset class="grid gap-2">
			<NameInput
				placeholder={m.common_permission()}
				bind:value={state.value.permission.permission}
				bind:valid={state.valid.permission}
			/>
		</fieldset>

		<button
			class="text-muted grid size-12 place-items-center hover:text-white"
			onclick={() => manager.data.removeAccount(index)}
		>
			<XIcon />
		</button>
	</div>
{/snippet}

{#snippet AccountAuthDisplay()}
	<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
		<div class="col-span-2 space-y-1">
			<h3 class="h4 font-semibold">Other Accounts</h3>
			<p class="">
				Specify the account and permission names of other accounts that can control this permission.
			</p>
		</div>
		<div class="col-span-2 space-y-1">
			<Button class="float-right" variant="primary" onclick={manager.data.addAccount}
				>Add Account</Button
			>
		</div>
		{#if manager.data.accounts.length}
			<div class="subgrid gap-2">
				<div class="subgrid">
					<span>{m.common_permission_weight()}</span>
					<span>{m.common_account_name()}</span>
					<span>{m.common_permission_name()}</span>
				</div>
				{#each manager.data.accounts as account, index (account)}
					{@render AccountAuthInput(index)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet WaitAuthInput(index: number)}
	{@const state = manager.data.waits[index]}
	<div class="subgrid">
		<NumberInput
			placeholder={m.common_permission_weight()}
			min={1}
			bind:value={state.value.weight}
			bind:valid={state.valid.weight}
		/>

		<NumberInput
			class="col-span-2"
			min={1}
			bind:value={state.value.wait_sec}
			bind:valid={state.valid.wait_sec}
		/>

		<button
			class="text-muted grid size-12 place-items-center hover:text-white"
			onclick={() => manager.data.removeWait(index)}
		>
			<XIcon />
		</button>
	</div>
{/snippet}

{#snippet WaitAuthDisplay()}
	<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
		<div class="col-span-2 space-y-1">
			<h3 class="h4 font-semibold">Waiting Period</h3>
			<p class="">
				Specify a minimum time (in seconds) the proposal must be active before the transaction can
				be completed.
			</p>
		</div>
		<div class="col-span-2 space-y-1">
			<Button class="float-right" variant="primary" onclick={manager.data.addWait}>Add Wait</Button>
		</div>
		{#if manager.data.waits.length}
			<div class="subgrid gap-2">
				<div class="subgrid">
					<span>{m.common_permission_weight()}</span>
					<span>Wait (Seconds)</span>
				</div>

				{#each manager.data.waits as wait, index (wait)}
					{@render WaitAuthInput(index)}
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet LinkedAuthInput(index: number)}
	{@const state = manager.data.linked[index]}
	<div class="subgrid">
		<fieldset class="grid gap-2">
			<NameInput
				placeholder={m.common_contract()}
				bind:value={state.value.account}
				bind:valid={state.valid.account}
			/>
		</fieldset>

		<fieldset class="grid gap-2">
			<NameInput
				optional
				placeholder={m.common_permission()}
				bind:value={state.value.action}
				bind:valid={state.valid.action}
			/>
		</fieldset>

		<button
			class="text-muted grid size-12 place-items-center hover:text-white"
			onclick={() => manager.data.removeLinked(index)}
		>
			<XIcon />
		</button>
	</div>
{/snippet}

{#snippet LinkedAuthDisplay()}
	<header class="col-span-full">
		<h2 class="text-xl font-semibold text-white">Contract Isolation</h2>
		<p>If specified, restrict this permission to the contracts and actions listed.</p>
	</header>
	<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
		<div class="col-span-2 space-y-1">
			<h3 class="h4 font-semibold">Contracts</h3>
			<p class="">Enter each contract and action this permission can perform.</p>
		</div>
		<div class="col-span-2 space-y-1">
			<Button class="float-right" variant="primary" onclick={manager.data.addLinked}>
				Add Contract
			</Button>
		</div>

		{#if manager.data.linked.length}
			<div class="subgrid gap-2">
				<div class="subgrid">
					<span>{m.common_contract()}</span>
					<span>{m.common_action()}</span>
				</div>
				{#each manager.data.linked as linkedaction, index (linkedaction)}
					{@render LinkedAuthInput(index)}
				{/each}
			</div>
			<div class="col-span-2 space-y-1">
				<p class="">Leave the action blank to allow all actions on a contract.</p>
			</div>
		{/if}
	</div>
{/snippet}

{#if transactError}
	<TransactError error={transactError} />
	<Button variant="primary" onclick={() => (transactError = undefined)}>Back</Button>
{:else if transactionId}
	<TransactSummary transactionId={String(transactionId)} />
	<Button href={`/${data.network}/account/${data.account.name}/permissions`} variant="secondary">
		Back to Permissions
	</Button>
	<Button href={`/${data.network}/account/${data.account.name}`}>
		{m.common_view_my_account()}
	</Button>
{:else}
	<article class="relative col-span-full grid gap-12">
		<section class="grid grid-cols-[12ch_1fr_1fr_auto] gap-6">
			<div class="col-span-full grid gap-4 rounded-lg">
				<div class="col-span-full space-y-1">
					<h3 class="h3 font-semibold">Permission</h3>
					<p class="">The name and parent permission of this permission.</p>
				</div>
				{@render PermissionName()}
				{#if !manager.isOwnerPermission}
					{@render PermissionParent()}
				{/if}
				{@render PermissionType()}
			</div>

			{#if msigMode}
				<header class="col-span-full">
					<h2 class="text-xl font-semibold text-white">Authorizations</h2>
					<p>
						Configure the keys, accounts, and waits required to authorize actions using this
						permission.
					</p>
				</header>
				{@render WaitThreshold()}
			{/if}

			{@render KeyAuthDisplay()}

			{#if msigMode}
				{@render AccountAuthDisplay()}
				{@render WaitAuthDisplay()}
				{#if manager.data.allowLinkedActions}
					{@render LinkedAuthDisplay()}
				{/if}
			{/if}

			<footer class="col-span-full flex justify-end gap-4 *:flex-none">
				{#if manager.permission && !manager.data.isActive && !manager.data.isOwner}
					<Button class="text-solar-700 " variant="tertiary" onclick={deleteAuth}
						>Delete Permission</Button
					>
				{/if}
				<Button variant="tertiary" href={i18n.route(data.backPath)}>Cancel</Button>
				<Button
					variant="primary"
					disabled={!manager.data.ready || context.wharf.transacting}
					onclick={transact}>Save Permission</Button
				>
			</footer>
		</section>
	</article>
{/if}

<Code json={manager} />
