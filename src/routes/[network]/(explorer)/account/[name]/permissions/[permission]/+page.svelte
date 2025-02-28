<script lang="ts">
	import XIcon from 'lucide-svelte/icons/x';
	import { getContext } from 'svelte';

	import Code from '$lib/components/code.svelte';
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
	import { PermissionManager } from './manager.svelte.js';
	import type { Checksum256Type } from '@wharfkit/session';

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	const manager = new PermissionManager({
		context,
		account: data.account,
		permissionName: data.permissionName
	});

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
</script>

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
			<header class="col-span-full">
				<h2 class="text-xl font-semibold text-white">Authorizations</h2>
				<p>
					Edit which authorizations are available for the {data.permissionName} permission of the
					{data.name} account
				</p>
			</header>

			<div class="col-span-full grid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-full space-y-1">
					<h3 class="h4 font-semibold">Permission</h3>
					<p class="">The name and parent permission of this permission.</p>
				</div>
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
				{#if !manager.isOwnerPermission}
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
				{/if}
			</div>

			<div class="col-span-full grid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-full space-y-1">
					<h3 class="h4 font-semibold">Threshold</h3>
					<p class="">
						Define how many accounts, keys, or waits are required to authorize the permission
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

			<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-2 space-y-1">
					<h3 class="h4 font-semibold">Keys</h3>
					<p class="">Additional keys that can authorize the permission</p>
				</div>
				<div class="col-span-2 space-y-1">
					<Button class="float-right" variant="primary" onclick={manager.data.addKey}
						>Add Key</Button
					>
				</div>
				{#if manager.data.keys.length}
					<div class="subgrid gap-2">
						<div class="subgrid">
							<span>{m.common_permission_weight()}</span>
							<span>{m.common_public_key()}</span>
						</div>
						{#each manager.data.keys as key, index (key)}
							<div class="subgrid">
								<NumberInput
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

								<button
									class="text-muted grid size-12 place-items-center hover:text-white"
									onclick={() => manager.data.removeKey(index)}
								>
									<XIcon class="size-6" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-2 space-y-1">
					<h3 class="h4 font-semibold">Accounts</h3>
					<p class="">Additional accounts that can authorize the permission</p>
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
							<div class="subgrid">
								<fieldset class="grid gap-2">
									<NumberInput
										min={1}
										placeholder={m.common_permission_weight()}
										bind:value={manager.data.accounts[index].value.weight}
										bind:valid={manager.data.accounts[index].valid.weight}
									/>
								</fieldset>

								<fieldset class="grid gap-2">
									<NameInput
										placeholder={m.common_account()}
										bind:value={manager.data.accounts[index].value.permission.actor}
										bind:valid={manager.data.accounts[index].valid.actor}
									/>
								</fieldset>

								<fieldset class="grid gap-2">
									<NameInput
										placeholder={m.common_permission()}
										bind:value={manager.data.accounts[index].value.permission.permission}
										bind:valid={manager.data.accounts[index].valid.permission}
									/>
								</fieldset>

								<button
									class="text-muted grid size-12 place-items-center hover:text-white"
									onclick={() => manager.data.removeAccount(index)}
								>
									<XIcon />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-2 space-y-1">
					<h3 class="h4 font-semibold">Waits</h3>
					<p class="">Increase the amount of time required to execute a transaction</p>
				</div>
				<div class="col-span-2 space-y-1">
					<Button class="float-right" variant="primary" onclick={manager.data.addWait}
						>Add Wait</Button
					>
				</div>
				{#if manager.data.waits.length}
					<div class="subgrid gap-2">
						<div class="subgrid">
							<span>{m.common_permission_weight()}</span>
							<span>Wait (Seconds)</span>
						</div>

						{#each manager.data.waits as wait, index (wait)}
							<div class="subgrid">
								<NumberInput
									placeholder={m.common_permission_weight()}
									min={1}
									bind:value={manager.data.waits[index].value.weight}
									bind:valid={manager.data.waits[index].valid.weight}
								/>

								<NumberInput
									class="col-span-2"
									min={1}
									bind:value={manager.data.waits[index].value.wait_sec}
									bind:valid={manager.data.waits[index].valid.wait_sec}
								/>

								<button
									class="text-muted grid size-12 place-items-center hover:text-white"
									onclick={() => manager.data.removeWait(index)}
								>
									<XIcon />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			{#if manager.data.allowLinkedActions}
				<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
					<div class="col-span-2 space-y-1">
						<h3 class="h4 font-semibold">Contracts</h3>
						<p class="">
							Add or remove contracts associated with the {data.permissionName} permission of the
							{data.name}
							account
						</p>
					</div>
					<div class="col-span-2 space-y-1">
						<Button class="float-right" variant="primary" onclick={manager.data.addLinked}>
							Add allowed Contract/Actions
						</Button>
					</div>

					{#if manager.data.linked.length}
						<div class="subgrid gap-2">
							<div class="subgrid">
								<span>{m.common_contract()}</span>
								<span>{m.common_action()}</span>
							</div>
							{#each manager.data.linked as linkedaction, index (linkedaction)}
								<div class="subgrid">
									<fieldset class="grid gap-2">
										<NameInput
											placeholder={m.common_contract()}
											bind:value={linkedaction.value.account}
											bind:valid={linkedaction.valid.account}
										/>
									</fieldset>

									<fieldset class="grid gap-2">
										<NameInput
											optional
											placeholder={m.common_permission()}
											bind:value={linkedaction.value.action}
											bind:valid={linkedaction.valid.action}
										/>
									</fieldset>

									<button
										class="text-muted grid size-12 place-items-center hover:text-white"
										onclick={() => manager.data.removeLinked(index)}
									>
										<XIcon />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<footer class="col-span-full flex justify-end gap-4 *:flex-none">
				<Button variant="tertiary" href={i18n.route(data.backPath)}>Cancel</Button>
				<Button
					variant="primary"
					disabled={!manager.data.ready || context.wharf.transacting}
					onclick={transact}>Save</Button
				>
			</footer>
		</section>
	</article>
{/if}

{#if context.settings.data.debugMode}
	<Code json={manager.data} />
{/if}
