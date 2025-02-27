<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import {
		API,
		Authority,
		KeyWeight,
		Name,
		PermissionLevelWeight,
		PublicKey,
		UInt16,
		WaitWeight,
		type ABISerializable,
		type PublicKeyType
	} from '@wharfkit/antelope';
	import PublicKeyInput from '$lib/components/input/publickey.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import { Contract as SystemContract } from '$lib/wharf/contracts/system';
	import Button from '$lib/components/button/button.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { XIcon } from 'lucide-svelte';
	import { i18n } from '$lib/i18n';

	interface AntelopeValid<T extends ABISerializable> {
		value: T;
		valid: {
			[key: string]: boolean;
		};
	}

	const context = getContext<UnicoveContext>('state');
	const { data } = $props();

	// Editable authority state
	let threshold = $state(1);
	let name: AntelopeValid<Name> = $state({
		value: data.permissionName,
		valid: { name: false }
	});
	let parent: AntelopeValid<Name> = $state({
		value: Name.from(''),
		valid: { parent: false }
	});
	let accounts: AntelopeValid<PermissionLevelWeight>[] = $state([]);
	let keys: AntelopeValid<KeyWeight>[] = $state([]);
	let waits: AntelopeValid<WaitWeight>[] = $state([]);
	let linked: AntelopeValid<API.v1.AccountLinkedAction>[] = $state([]);

	// The authority has at least one auth set
	const hasAuth = $derived(accounts.length + keys.length > 0);

	// Weight totals
	const totalAccountWeight = $derived(
		accounts.reduce((acc, a) => acc.adding(a.value.weight), UInt16.from(0))
	);
	const totalKeyWeight = $derived(
		keys.reduce((acc, k) => acc.adding(k.value.weight), UInt16.from(0))
	);
	const totalWaitWeight = $derived(
		waits.reduce((acc, w) => acc.adding(w.value.weight), UInt16.from(0))
	);
	const totalWeight = $derived(totalAccountWeight.adding(totalKeyWeight).adding(totalWaitWeight));

	// If the weights can meet the threshold
	const meetsThreshold = $derived(Number(totalWeight) >= threshold);

	// Validity of all inputs
	function valid<T extends ABISerializable>(a: AntelopeValid<T>): boolean {
		return Object.values(a.valid).every((v) => v);
	}
	const accountsValid = $derived(accounts.every(valid));
	const keysValid = $derived(keys.every(valid));
	const waitsValid = $derived(waits.every(valid));
	const thresholdValid = $derived(threshold >= 1);

	// All inputs and validations are valid
	const allValid = $derived(
		meetsThreshold &&
			hasAuth &&
			accountsValid &&
			keysValid &&
			waitsValid &&
			thresholdValid &&
			valid(name) &&
			valid(parent)
	);

	// Whether linked actions are allowed (Disallow on owner and active permissions)
	const allowLinkedActions = $derived(
		!data.permissionName.equals('owner') && !data.permissionName.equals('active')
	);

	// Determine if the permission has been modified
	const derivedAuthority = $derived.by(() => {
		try {
			return Authority.from({
				threshold,
				accounts: accounts.map((a) => a.value),
				keys: keys.map((k) => KeyWeight.from(k.value)),
				waits: waits.map((w) => w.value)
			});
		} catch (e) {
			console.warn(e);
		}
	});
	const modified = $derived(
		derivedAuthority && !data.permission?.required_auth.equals(derivedAuthority)
	);

	onMount(() => {
		if (data.permission) {
			const auths = data.permission.required_auth;
			threshold = Number(auths.threshold);
			parent = {
				value: data.permission.parent,
				valid: {
					parent: false
				}
			};
			accounts = auths.accounts.map((account) => ({
				value: account,
				valid: {
					actor: false,
					permission: false,
					weight: false
				}
			}));
			keys = auths.keys.map((key) => ({
				value: key,
				valid: {
					key: false,
					weight: false
				}
			}));
			waits = auths.waits.map((wait) => ({
				value: wait,
				valid: {
					wait_sec: false,
					weight: false
				}
			}));
			linked = data.permission.linked_actions.map((linked) => ({
				value: linked,
				valid: {
					account: false,
					action: false
				}
			}));
		}
	});

	async function transact() {
		const contract = new SystemContract({ client: data.network.client });
		if (!data.permission) {
			return;
		}
		// const typedKeys = keys.map((key) => ({
		// 	key: PublicKey.from(key.key),
		// 	weight: UInt16.from(key.weight)
		// }));
		const action = contract.action('updateauth', {
			account: data.name,
			permission: data.permissionName,
			parent: data.permission.parent,
			auth: {
				threshold,
				accounts: accounts.map((a) => a.value),
				keys: keys
					.filter((k) => k.value.key)
					.map((k) => ({
						key: PublicKey.from(k.value.key as PublicKeyType),
						weight: k.value.weight
					})),
				waits: waits.map((w) => w.value)
			}
		});

		console.log('action', {
			account: data.name,
			permission: data.permissionName,
			parent: data.permission.parent,
			auth: {
				threshold,
				accounts: accounts.map((a) => a.value),
				keys: keys
					.filter((k) => k.value.key)
					.map((k) => ({
						key: PublicKey.from(k.value.key as PublicKeyType),
						weight: k.value.weight
					})),
				waits: waits.map((w) => w.value)
			}
		});
	}

	const addAccount = () =>
		accounts.push({
			value: PermissionLevelWeight.from({
				permission: {
					actor: '',
					permission: ''
				},
				weight: 1
			}),
			valid: {
				actor: false,
				permission: false,
				weight: false
			}
		});

	const addKey = () =>
		keys.push({
			value: KeyWeight.from({
				key: undefined,
				weight: 1
			}),
			valid: {
				key: false,
				weight: false
			}
		});

	const addWait = () =>
		waits.push({
			value: WaitWeight.from({
				wait_sec: 0,
				weight: 1
			}),
			valid: {
				wait_sec: false,
				weight: false
			}
		});

	const addLinked = () =>
		linked.push({
			value: API.v1.AccountLinkedAction.from({
				account: '',
				action: ''
			}),
			valid: {
				contract: false,
				action: false
			}
		});

	const removeAccount = (index: number) => accounts.splice(index, 1);
	const removeKey = (index: number) => keys.splice(index, 1);
	const removeWait = (index: number) => waits.splice(index, 1);
	const removeLinked = (index: number) => linked.splice(index, 1);
</script>

<article class="relative col-span-full grid gap-12">
	<section class="grid grid-cols-[12ch_1fr_1fr_auto] gap-6">
		<header class="col-span-full">
			<h2 class="text-xl font-semibold text-white">Authorizations</h2>
			<p>
				Edit which authorizations are available for the {name} permission of the
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
					placeholder={m.common_permission_name()}
					bind:value={name.value}
					bind:valid={name.valid.name}
				/>
			</fieldset>
			<fieldset class="grid gap-2">
				<Label class="text-xs" for="permission_parent">Parent Permission</Label>
				<NameInput
					id="permission_parent"
					placeholder="Parent Permission"
					bind:value={parent.value}
					bind:valid={parent.valid.parent}
				/>
			</fieldset>
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
					placeholder={m.common_permission_threshold()}
					bind:value={threshold}
				/>
			</fieldset>
		</div>

		<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
			<div class="col-span-2 space-y-1">
				<h3 class="h4 font-semibold">Keys</h3>
				<p class="">Additional keys that can authorize the permission</p>
			</div>
			<div class="col-span-2 space-y-1">
				<Button class="float-right" variant="primary" onclick={addKey}>Add Key</Button>
			</div>
			{#if keys.length}
				<div class="subgrid gap-2">
					<div class="subgrid">
						<span>{m.common_permission_weight()}</span>
						<span>{m.common_public_key()}</span>
					</div>
					{#each keys as key, index (key)}
						<div class="subgrid">
							<NumberInput
								id={`key-${index}-weight`}
								min={1}
								bind:value={keys[index].value.weight}
								bind:valid={keys[index].valid.weight}
							/>

							<PublicKeyInput
								class="col-span-2"
								id="key-{index}-key"
								placeholder={m.common_public_key()}
								bind:value={keys[index].value.key}
								bind:valid={keys[index].valid.key}
							/>

							<button
								class="text-muted grid size-12 place-items-center hover:text-white"
								onclick={() => removeKey(index)}
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
				<Button class="float-right" variant="primary" onclick={addAccount}>Add Account</Button>
			</div>
			{#if accounts.length}
				<div class="subgrid gap-2">
					<div class="subgrid">
						<span>{m.common_permission_weight()}</span>
						<span>{m.common_account_name()}</span>
						<span>{m.common_permission_name()}</span>
					</div>
					{#each accounts as account, index (account)}
						<div class="subgrid">
							<fieldset class="grid gap-2">
								<NumberInput
									min={1}
									placeholder={m.common_permission_weight()}
									bind:value={accounts[index].value.weight}
									bind:valid={accounts[index].valid.weight}
								/>
							</fieldset>

							<fieldset class="grid gap-2">
								<NameInput
									placeholder={m.common_account()}
									bind:value={accounts[index].value.permission.actor}
									bind:valid={accounts[index].valid.actor}
								/>
							</fieldset>

							<fieldset class="grid gap-2">
								<NameInput
									placeholder={m.common_permission()}
									bind:value={accounts[index].value.permission.permission}
									bind:valid={accounts[index].valid.permission}
								/>
							</fieldset>

							<button
								class="text-muted grid size-12 place-items-center hover:text-white"
								onclick={() => removeAccount(index)}
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
				<Button class="float-right" variant="primary" onclick={addWait}>Add Wait</Button>
			</div>
			{#if waits.length}
				<div class="subgrid gap-2">
					<div class="subgrid">
						<span>{m.common_permission_weight()}</span>
						<span>Wait (Seconds)</span>
					</div>

					{#each waits as wait, index (wait)}
						<div class="subgrid">
							<NumberInput
								placeholder={m.common_permission_weight()}
								min={1}
								bind:value={waits[index].value.weight}
								bind:valid={waits[index].valid.weight}
							/>

							<NumberInput
								class="col-span-2"
								bind:value={waits[index].value.wait_sec}
								bind:valid={waits[index].valid.wait_sec}
							/>

							<button
								class="text-muted grid size-12 place-items-center hover:text-white"
								onclick={() => removeWait(index)}
							>
								<XIcon />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		{#if allowLinkedActions}
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
					<Button class="float-right" variant="primary" onclick={addLinked}
						>Add Linked Contract</Button
					>
				</div>

				{#if linked.length}
					<div class="subgrid gap-2">
						<div class="subgrid">
							<span>{m.common_contract()}</span>
							<span>{m.common_action()}</span>
						</div>
						{#each linked as linkedaction, index (linkedaction)}
							<div class="subgrid">
								<fieldset class="grid gap-2">
									<NameInput
										placeholder={m.common_contract()}
										bind:value={linked[index].value.account}
										bind:valid={linked[index].valid.account}
									/>
								</fieldset>

								<fieldset class="grid gap-2">
									<NameInput
										placeholder={m.common_permission()}
										bind:value={linked[index].value.action}
										bind:valid={linked[index].valid.action}
									/>
								</fieldset>

								<button
									class="text-muted grid size-12 place-items-center hover:text-white"
									onclick={() => removeLinked(index)}
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
			<Button variant="primary" disabled={!allValid} onclick={transact}>Save</Button>
		</footer>
	</section>
</article>

{#if context.settings.data.debugMode}
	<Code
		>{JSON.stringify(
			{
				name,
				parent,
				threshold,
				accounts,
				keys,
				waits,
				linked,
				totalAccountWeight,
				totalKeyWeight,
				totalWaitWeight,
				totalWeight,
				meetsThreshold,
				allValid,
				allowLinkedActions,
				modified
			},
			undefined,
			2
		)}</Code
	>
{/if}
