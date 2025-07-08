<script lang="ts">
	import { getContext } from 'svelte';

	import {
		FormContent as FormSectionContent,
		FormHeader as FormSectionHeader,
		FormSection,
		HR as FormDivider,
		Form
	} from 'unicove-components';
	import RemoveRowButton from '$lib/components/form/removeRowButton.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import * as m from '$lib/paraglide/messages';
	import { PublicKeyInput } from 'unicove-components';
	import { NameInput } from 'unicove-components';
	import { NumberInput } from 'unicove-components';
	import { Button } from 'unicove-components';
	import { Label } from 'unicove-components';
	import { i18n } from '$lib/i18n';
	import { Select } from 'unicove-components';
	import TransactSummary from '$lib/components/transact/summary.svelte';
	import TransactError from '$lib/components/transact/error.svelte';
	import {
		PermissionManager,
		permissionTypeBasic,
		permissionTypeMsig,
		permissionTypeSelects
	} from './manager.svelte.js';
	import { type Checksum256Type } from '@wharfkit/session';
	import type { SelectOption } from '@melt-ui/svelte';
	import type { ExtendedSelectOption } from 'unicove-components';
	import type { ChangeFn } from '@melt-ui/svelte/internal/helpers';
	import { Code } from 'unicove-components';
	import PermissionComponent from '../permission.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Fieldset } from 'unicove-components';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const manager = new PermissionManager({
		context,
		account: data.account,
		permissionName: data.permissionName
	});

	let primaryElement: HTMLElement;

	const requiresMsigInterface = manager.data.isMsig || manager.data.hasAccountsOrWaits;
	let msigMode: boolean = $state(requiresMsigInterface);
	// let msigMode = true;
	let permissionTypeSelected: SelectOption = $state(
		requiresMsigInterface ? permissionTypeMsig : permissionTypeBasic
	);

	let transactionId: Checksum256Type | undefined = $state();
	let transactError: string | undefined = $state();
	let confirming: boolean = $state(false);

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
			})
			.finally(() => {
				confirming = false;
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

	function confirm() {
		confirming = true;
		primaryElement.scrollIntoView({ behavior: 'smooth' });
	}

	function back() {
		transactError = undefined;
		confirming = false;
		primaryElement.scrollIntoView({ behavior: 'smooth' });
	}

	const onPermissionTypeChange: ChangeFn<ExtendedSelectOption | undefined> = ({ next }) => {
		msigMode = next?.value === 'msig';
		manager.data.setDefaults();
		return next;
	};

	// Adds a default field for the first key on a new (basic) permission
	$effect(() => {
		if (!manager.data.keys.length && !msigMode) {
			manager.data.addKey();
		}
	});
</script>

{#snippet PermissionName()}
	<fieldset class="grid gap-3">
		<Label for="permission_name">{m.common_permission_name()}</Label>
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
	<fieldset class="grid gap-3">
		<Label for="permission_parent">{m.common_parent_permission()}</Label>
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
	<fieldset class="grid gap-3">
		<Label for="permission_type">{m.common_permission_type()}</Label>
		<Select
			id="permission_type"
			onSelectedChange={onPermissionTypeChange}
			options={permissionTypeSelects}
			variant="form"
			bind:selected={permissionTypeSelected}
		/>
		<p class="mt-2 text-pretty">
			{m.common_permission_form_reset()}
		</p>
	</fieldset>
{/snippet}

{#snippet WeightThreshold()}
	<FormSection>
		<FormSectionHeader
			title={m.common_weight_threshold()}
			text={m.common_weight_threshold_description()}
		/>
		<FormSectionContent>
			<Fieldset>
				<Label for="threshold">{m.common_required()}</Label>
				<NumberInput
					id="threshold"
					min={1}
					placeholder={m.common_permission_threshold()}
					bind:value={manager.data.threshold}
				/>
			</Fieldset>
		</FormSectionContent>
	</FormSection>
{/snippet}

{#snippet KeyAuthInput(index: number)}
	<!-- Don't transition the first input field -->
	{@const ms = index > 0 ? 120 : 0}
	{#if msigMode}
		<!-- Vertical gap is handled with 'my-2' to allow for the field 'labels' to be closer than if we used 'gap-4' -->
		<li
			in:fly|global={{ x: ms, duration: ms, easing: cubicOut }}
			id={`key-${index}-inputs`}
			class="subgrid text-on-surface my-2 gap-2 first:mt-0 last:mb-0"
		>
			<Fieldset>
				<Label for={`key-${index}-weight`} class={index > 0 ? 'hidden' : ''}>
					<span>{m.common_permission_weight()}</span>
				</Label>
				<NumberInput
					id={`key-${index}-weight`}
					min={1}
					bind:value={manager.data.keys[index].value.weight}
					bind:valid={manager.data.keys[index].valid.weight}
				/>
			</Fieldset>

			<Fieldset>
				<Label for={`key-${index}-key`} class={index > 0 ? 'hidden' : ''}>
					<span>{m.common_public_key()}</span>
				</Label>
				<PublicKeyInput
					class="col-span-1"
					id="key-{index}-key"
					placeholder={m.common_public_key()}
					bind:value={manager.data.keys[index].value.key}
					bind:valid={manager.data.keys[index].valid.key}
				/>
			</Fieldset>

			<RemoveRowButton onclick={() => manager.data.removeKey(index)} />
		</li>
	{:else}
		<!-- Basic mode -->
		<!-- Vertical gap is handled with 'my-2' to allow for the field 'labels' to be closer than if we used 'gap-4' -->
		<li
			in:fly|global={{ x: ms, duration: ms, easing: cubicOut }}
			id={`key-${index}-input`}
			class="subgrid text-on-surface my-2 gap-x-2 first:mt-0 last:mb-0"
		>
			<NumberInput
				class="hidden"
				min={1}
				bind:value={manager.data.keys[index].value.weight}
				bind:valid={manager.data.keys[index].valid.weight}
			/>

			<PublicKeyInput
				class={index > 0 ? 'col-span-2' : 'col-span-full'}
				id="key-{index}-key"
				placeholder={'PUB_K1...'}
				bind:value={manager.data.keys[index].value.key}
				bind:valid={manager.data.keys[index].valid.key}
			/>

			{#if index > 0}
				<RemoveRowButton onclick={() => manager.data.removeKey(index)} />
			{/if}
		</li>
	{/if}
{/snippet}

{#snippet KeyAuthDisplay()}
	<FormSection>
		<FormSectionHeader title={m.common_key_pairs()} text={m.common_key_pairs_description()} />

		<FormSectionContent>
			{#if manager.data.keys.length}
				<ul class="grid grid-cols-[8ch_1fr_auto] gap-x-2">
					{#each manager.data.keys as key, index (key)}
						{@render KeyAuthInput(index)}
					{/each}
				</ul>
			{/if}

			<Button class="float-right" variant="primary" onclick={manager.data.addKey}
				>{m.common_add_key()}</Button
			>
		</FormSectionContent>
	</FormSection>
{/snippet}

{#snippet AccountAuthInput(index: number)}
	{@const state = manager.data.accounts[index]}
	<!-- We don't transition the first input field -->
	{@const ms = index > 0 ? 120 : 0}
	<!-- Vertical gap is handled with 'my-2' to allow for the field 'labels' to be closer than if we used 'gap-4' -->
	<li
		class="@md:subgrid card text-on-surface col-span-full my-2 grid grid-cols-2 gap-4 rounded-lg p-4 first:mt-0 last:mb-0 @md:gap-2 @md:bg-transparent @md:p-0"
		in:fly|global={{ x: ms, duration: ms, easing: cubicOut }}
	>
		<Fieldset class="">
			<Label for={`account-${index}-weight`} class={index > 0 ? '@md:hidden' : ''}>
				<span>{m.common_permission_weight()}</span>
			</Label>
			<NumberInput
				id={`account-${index}-weight`}
				min={1}
				placeholder={m.common_permission_weight()}
				bind:value={state.value.weight}
				bind:valid={state.valid.weight}
			/>
		</Fieldset>

		<Fieldset>
			<Label for={`account-${index}-name`} class={index > 0 ? '@md:hidden' : ''}>
				<span>{m.common_account_name()}</span>
			</Label>
			<NameInput
				id={`account-${index}-name`}
				placeholder={m.common_account()}
				bind:value={state.value.permission.actor}
				bind:valid={state.valid.actor}
			/>
		</Fieldset>

		<Fieldset>
			<Label for={`account-${index}-permission`} class={index > 0 ? '@md:hidden' : ''}>
				<span>{m.common_permission_name()}</span>
			</Label>
			<NameInput
				id={`account-${index}-permission`}
				placeholder={m.common_permission()}
				bind:value={state.value.permission.permission}
				bind:valid={state.valid.permission}
			/>
		</Fieldset>

		<RemoveRowButton
			class="col-start-2 row-start-1 self-start justify-self-end @md:col-start-auto @md:row-start-auto @md:self-end @md:justify-self-center"
			onclick={() => manager.data.removeAccount(index)}
		/>
	</li>
{/snippet}

{#snippet AccountAuthDisplay()}
	<FormSection>
		<FormSectionHeader
			title={m.common_permission_other_accounts()}
			text={m.common_permission_other_accounts_description()}
		/>

		<FormSectionContent>
			{#if manager.data.accounts.length}
				<ul class="@container grid grid-cols-[8ch_1fr_1fr_auto] gap-x-2">
					{#each manager.data.accounts as account, index (account)}
						{@render AccountAuthInput(index)}
					{/each}
				</ul>
			{/if}

			<Button class="float-right" variant="primary" onclick={manager.data.addAccount}>
				{m.common_add_account()}
			</Button>
		</FormSectionContent>
	</FormSection>
{/snippet}

{#snippet WaitAuthInput(index: number)}
	{@const state = manager.data.waits[index]}
	<li class="subgrid text-on-surface">
		<Fieldset>
			<Label for={`wait-${index}-name`} class={index > 0 ? 'hidden' : ''}>
				<span>{m.common_permission_weight()}</span>
			</Label>
			<NumberInput
				id={`wait-${index}-name`}
				placeholder={m.common_permission_weight()}
				min={1}
				bind:value={state.value.weight}
				bind:valid={state.valid.weight}
			/>
		</Fieldset>

		<Fieldset>
			<Label for={`wait-${index}-value`} class={index > 0 ? 'hidden' : ''}>
				<span>{m.common_wait_seconds()}</span>
			</Label>
			<NumberInput
				id={`wait-${index}-value`}
				min={1}
				bind:value={state.value.wait_sec}
				bind:valid={state.valid.wait_sec}
			/>
		</Fieldset>

		<RemoveRowButton onclick={() => manager.data.removeWait(index)} />
	</li>
{/snippet}

{#snippet WaitAuthDisplay()}
	<FormSection>
		<FormSectionHeader
			title={m.common_waiting_period()}
			text={m.common_waiting_period_description()}
		/>

		<FormSectionContent>
			{#if manager.data.waits.length}
				<ul class="grid grid-cols-[8ch_1fr_auto] gap-2">
					{#each manager.data.waits as wait, index (wait)}
						{@render WaitAuthInput(index)}
					{/each}
				</ul>
			{/if}

			<Button
				disabled={manager.data.waits.length > 0}
				class="float-right"
				variant="primary"
				onclick={manager.data.addWait}>{m.common_add_wait()}</Button
			>
		</FormSectionContent>
	</FormSection>
{/snippet}

{#snippet LinkedAuthInput(index: number)}
	{@const state = manager.data.linked[index]}
	<!-- Don't transition the first input field -->
	{@const ms = index > 0 ? 120 : 0}
	<li
		class="subgrid text-on-surface my-2 first:mt-0 last:mb-0"
		in:fly|global={{ x: ms, duration: ms, easing: cubicOut }}
	>
		<Fieldset>
			<Label for={`contract-${index}-account`} class={index > 0 ? 'hidden' : ''}>
				<span>{m.common_contract()}</span>
			</Label>
			<NameInput
				id={`contract-${index}-account`}
				placeholder={m.common_contract()}
				bind:value={state.value.account}
				bind:valid={state.valid.account}
			/>
		</Fieldset>

		<Fieldset>
			<Label for={`contract-${index}-action`} class={index > 0 ? 'hidden' : ''}>
				<span>{m.common_action()}</span>
			</Label>
			<NameInput
				optional
				id={`contract-${index}-action`}
				placeholder={m.common_action()}
				bind:value={state.value.action}
				bind:valid={state.valid.action}
			/>
		</Fieldset>

		<RemoveRowButton onclick={() => manager.data.removeLinked(index)} />
	</li>
{/snippet}

{#snippet LinkedAuthDisplay()}
	<FormSection>
		<FormSectionHeader
			title={m.common_contract_isolation()}
			text={m.common_contract_isolation_description()}
		/>

		<FormSectionContent>
			{#if manager.data.linked.length}
				<ul class="grid grid-cols-[1fr_1fr_auto] gap-x-2">
					{#each manager.data.linked as linkedaction, index (linkedaction)}
						{@render LinkedAuthInput(index)}
					{/each}
				</ul>
			{/if}

			<Button class="float-right" variant="primary" onclick={manager.data.addLinked}>
				{m.common_add_contract()}
			</Button>
		</FormSectionContent>
	</FormSection>
{/snippet}

{#snippet ConfirmingDetails()}
	<article class="grid gap-8 @3xl:gap-12">
		<FormSectionHeader
			title={m.common_confirm_details()}
			text={m.common_confirm_permission_details()}
		></FormSectionHeader>

		<ul class="grid grid-cols-[auto_1fr] overflow-x-auto">
			<PermissionComponent
				account={manager.data.name.value.name}
				advancedMode={false}
				currentUser={false}
				loggedIn={false}
				msigMode={false}
				signin={async () => {}}
				permission={{
					permission: manager.data.modifiedPermission,
					children: []
				}}
			/>
		</ul>

		<footer class="flex gap-4">
			<Button onclick={back} variant="secondary">{m.common_back()}</Button>
			<Button onclick={transact} variant="primary">{m.common_save_permission()}</Button>
		</footer>
	</article>
{/snippet}

{#snippet BasicInformation()}
	<FormSection>
		<FormSectionHeader
			title={m.common_basic_information()}
			text={m.common_basic_permission_description()}
		/>

		<FormSectionContent>
			{@render PermissionName()}
			{#if !manager.isOwnerPermission}
				{@render PermissionParent()}
			{/if}
			{@render PermissionType()}
		</FormSectionContent>
	</FormSection>
{/snippet}

<div class="pt-6" bind:this={primaryElement}>
	{#if transactionId}
		<!-- Successful transaction -->
		<TransactSummary transactionId={String(transactionId)} />

		<footer class="">
			<Button
				href={`/${data.network}/account/${data.account.name}/permissions`}
				variant="secondary"
			>
				{m.common_back_to_permissions()}
			</Button>
			<Button href={`/${data.network}/account/${data.account.name}`}>
				{m.common_view_my_account()}
			</Button>
		</footer>
	{:else if transactError}
		<!-- Unsuccessful transaction -->
		<div
			class="bg-surface-container flex flex-col justify-center gap-8 rounded-xl px-4 py-12 sm:items-center"
		>
			<TransactError error={transactError} />
			<Button variant="primary" onclick={back}>{m.common_back()}</Button>
		</div>
	{:else if confirming}
		{@render ConfirmingDetails()}
	{:else}
		<!-- Editing Permission -->
		<Form>
			{@render BasicInformation()}
			<FormDivider />

			{#if msigMode}
				{@render WeightThreshold()}
				<FormDivider />
			{/if}

			{@render KeyAuthDisplay()}

			{#if msigMode}
				<FormDivider />
				{@render AccountAuthDisplay()}
				<FormDivider />
				{@render WaitAuthDisplay()}
				{#if manager.data.allowLinkedActions}
					<FormDivider />
					{@render LinkedAuthDisplay()}
				{/if}
			{/if}

			<FormDivider />

			<footer class="flex flex-col justify-between gap-y-12 @lg:flex-row">
				{#if manager.permission && !manager.data.isActive && !manager.data.isOwner}
					<Button class="text-error" variant="text" onclick={deleteAuth}
						>{m.common_delete_permission()}</Button
					>
				{/if}
				<div class="flex grow flex-col flex-wrap justify-end gap-6 @lg:flex-row">
					<Button class="grow-0" variant="text" href={i18n.route(data.backPath)}
						>{m.common_cancel()}</Button
					>
					<Button
						class="grow-0"
						variant="primary"
						disabled={!manager.data.ready || context.wharf.transacting}
						onclick={confirm}>{m.common_confirm()}</Button
					>
				</div>
			</footer>
		</Form>
	{/if}
</div>

{#if context.settings.data.debugMode}
	<Code json={manager} />
{/if}
