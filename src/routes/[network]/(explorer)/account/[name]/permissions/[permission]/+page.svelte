<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import TextInput from '$lib/components/input/text.svelte';
	import Permission from '../permission.svelte';
	import {
		API,
		Authority,
		Name,
		PublicKey,
		Serializer,
		UInt32,
		type PermissionLevelType,
		type PublicKeyType,
		type UInt16Type,
		type UInt32Type
	} from '@wharfkit/antelope';
	import PublicKeyInput from '$lib/components/input/publickey.svelte';
	import NameInput from '$lib/components/input/name.svelte';
	import NumberInput from '$lib/components/input/number.svelte';
	import { Contract as SystemContract, Types as SystemTypes } from '$lib/wharf/contracts/system';
	import Button from '$lib/components/button/button.svelte';
	import Card from '$lib/components/layout/box/card.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import Account from '$lib/components/button/account.svelte';
	import dayjs from 'dayjs';
	import { Clock, XIcon } from 'lucide-svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import Key from '$lib/components/elements/key.svelte';
	import { i18n } from '$lib/i18n';

	interface PermissionWeight {
		permission: {
			actor: Name;
			permission: Name;
		};
		weight: UInt16Type;
	}

	interface PermissionWeightElement {
		value: PermissionWeight;
		valid: {
			actor: boolean;
			permission: boolean;
			weight: boolean;
		};
	}

	interface KeyWeight {
		key: PublicKey | undefined;
		weight: UInt16Type;
	}

	interface KeyWeightElement {
		value: KeyWeight;
		valid: {
			key: boolean;
			weight: boolean;
		};
	}

	interface WaitWeight {
		wait_sec: UInt32Type;
		weight: UInt16Type;
	}

	interface WaitWeightElement {
		value: WaitWeight;
		valid: {
			wait_sec: boolean;
			weight: boolean;
		};
	}

	const context = getContext<UnicoveContext>('state');

	const { data } = $props();

	const defaultPermission = SystemTypes.authority.from({
		threshold: UInt32.from(1),
		accounts: [],
		keys: [],
		waits: []
	});

	let accounts: PermissionWeightElement[] = $state([]);
	let keys: KeyWeightElement[] = $state([]);
	let waits: WaitWeightElement[] = $state([]);
	let threshold = $state(1);

	let nameInputs: NameInput[] = [];

	onMount(() => {
		if (data.permission) {
			const auths = data.permission.required_auth;
			threshold = auths.threshold.value;
			accounts = auths.accounts.map((account) => ({
				value: {
					permission: {
						actor: account.permission.actor,
						permission: account.permission.permission
					},
					weight: account.weight
				},
				valid: {
					actor: false,
					permission: false,
					weight: false
				}
			}));
			keys = auths.keys.map((key) => ({
				value: {
					key: key.key,
					weight: key.weight
				},
				valid: {
					key: false,
					weight: false
				}
			}));
			waits = auths.waits.map((wait) => ({
				value: {
					wait_sec: wait.wait_sec,
					weight: wait.weight
				},
				valid: {
					wait_sec: false,
					weight: false
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

	const hasAtleastOneAuth = $derived(accounts.length + keys.length > 0);
	const accountsValid = $derived(accounts.every((a) => Object.values(a.valid).every((v) => v)));
	const keysValid = $derived(keys.every((k) => Object.values(k.valid).every((v) => v)));
	const waitsValid = $derived(waits.every((w) => Object.values(w.valid).every((v) => v)));
	const allValid = $derived(hasAtleastOneAuth && accountsValid && keysValid && waitsValid);

	$inspect(allValid);
	$inspect(accounts);
	$inspect(keys);
	$inspect(waits);
	$inspect(threshold);

	const addAccount = () =>
		accounts.push({
			value: {
				permission: {
					actor: Name.from(''),
					permission: Name.from('')
				},
				weight: 1
			},
			valid: {
				actor: false,
				permission: false,
				weight: false
			}
		});

	const addKey = () =>
		keys.push({
			value: {
				key: undefined,
				weight: 1
			},
			valid: {
				key: false,
				weight: false
			}
		});

	const addWait = () =>
		waits.push({
			value: {
				wait_sec: 0,
				weight: 1
			},
			valid: {
				wait_sec: false,
				weight: false
			}
		});

	const removeAccount = (index: number) => accounts.splice(index, 1);
	const removeKey = (index: number) => keys.splice(index, 1);
	const removeWait = (index: number) => waits.splice(index, 1);

	const modified = $derived.by(() => {
		// declare class AccountPermission extends Struct {
		// 	perm_name: Name;
		// 	parent: Name;
		// 	required_auth: Authority;
		// 	linked_actions: AccountLinkedAction[];
		// }
		if (!data.permission) {
			return;
		}
		try {
			return API.v1.AccountPermission.from({
				...data.permission,
				required_auth: Authority.from({
					threshold: UInt32.from(threshold),
					accounts: accounts.map((a) => ({
						permission: {
							actor: a.value.permission.actor,
							permission: a.value.permission.permission
						},
						weight: a.value.weight
					})),
					keys: keys
						.filter((k) => k.value.key)
						.map((k) => ({
							key: PublicKey.from(k.value.key as PublicKeyType),
							weight: k.value.weight
						})),
					waits: waits.filter((w) => w.value.wait_sec).map((w) => w.value)
				})
			});
		} catch {}
	});
</script>

{#if data.permission}
	<article class="relative col-span-full grid gap-12">
		<section class="grid grid-cols-[12ch_1fr_1fr_auto] gap-6">
			<header class="col-span-full">
				<h2 class="text-xl font-semibold text-white">Authorizations</h2>
				<p>
					Edit which authorizations are available for the {data.permission.perm_name} permission of the
					{data.name} account
				</p>
			</header>

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
				<div class="col-span-full space-y-1">
					<h3 class="h4 font-semibold">Keys</h3>
					<p class="">Additional keys that can authorize the permission</p>
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

				<Button class="col-span-full justify-self-start" variant="primary" onclick={addKey}
					>Add Key</Button
				>
			</div>

			<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-full space-y-1">
					<h3 class="h4 font-semibold">Accounts</h3>
					<p class="">Additional accounts that can authorize the permission</p>
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
				<Button class="col-span-full justify-self-start" variant="primary" onclick={addAccount}
					>Add Account</Button
				>
			</div>

			<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				<div class="col-span-full space-y-1">
					<h3 class="h4 font-semibold">Waits</h3>
					<p class="">Increase the amount of time required to execute a transaction</p>
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
				<Button class="col-span-full justify-self-start" variant="primary" onclick={addWait}
					>Add Wait</Button
				>
			</div>
		</section>

		<section class="grid grid-cols-[1fr_1fr_auto] gap-6">
			<header class="col-span-full">
				<h2 class="text-xl font-semibold text-white">Contracts</h2>
				<p>
					Add or remove contracts associated with the {data.permission.perm_name} permission of the
					{data.name}
					account
				</p>
			</header>

			<div class="subgrid gap-4 rounded-lg bg-mineShaft-950/50 p-4">
				{#if keys.length}
					<div class="subgrid gap-2">
						<div class="subgrid text-muted">
							<span>Contract</span>
							<span>Action</span>
						</div>
						{#each data.permission.linked_actions as { action, account }}
							<div class="subgrid items-center">
								<span class="account">{account}</span>
								<span class="action">::{action}</span>

								<button
									class=" text-muted grid size-12 place-items-center justify-self-end hover:text-white"
									onclick={() => {}}
								>
									<!-- TODO: Remove contract on click -->
									<XIcon class="size-6" />
								</button>
							</div>
						{/each}

						<TextInput />
						<TextInput />
						<Button variant="primary" onclick={addKey}>Add Contract</Button>
					</div>
				{/if}
			</div>
		</section>

		<footer class="col-span-full flex justify-end gap-4 *:flex-none">
			<Button variant="tertiary" href={i18n.route(data.backPath)}>Cancel</Button>
			<Button variant="primary" disabled={!allValid} onclick={transact}>Save</Button>
		</footer>
	</article>
{/if}

<!-- {#if modified} -->
<!-- 	<Permission permission={{ permission: modified, children: [] }} /> -->
<!-- {/if} -->

{#if context.settings.data.debugMode}
	<Code
		>{JSON.stringify(
			{
				allValid,
				accounts,
				keys,
				waits
			},
			undefined,
			2
		)}</Code
	>
{/if}
