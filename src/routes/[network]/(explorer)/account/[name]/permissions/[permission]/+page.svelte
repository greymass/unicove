<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext, onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
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
	import { Clock } from 'lucide-svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import Key from '$lib/components/elements/key.svelte';

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
	<li class="relative col-span-full grid grid-cols-subgrid bg-shark-950">
		<dl
			class="z-20 col-span-full space-y-1 rounded-t-lg bg-mineShaft-950 px-4 py-3 md:col-span-1 md:rounded-l-lg"
		>
			<div>
				<dt class="sr-only">{m.common_permission_name()}</dt>
				<dd class="text-xl font-semibold text-white">{data.permission.perm_name}</dd>
			</div>
			<div class="text-muted text-nowrap *:inline">
				<dt class="after:content-[':']">
					<span class="sr-only">{m.common_permission_threshold()}</span>
					{m.common_required()}
				</dt>
				<dd>{data.permission.required_auth.threshold}</dd>
			</div>
			{#if data.permission.linked_actions}
				<div class="">
					<dt class="sr-only">{m.common_actions()}</dt>
					{#each data.permission.linked_actions as { action, account }}
						<dd>
							<Contract name={account} {action} class="flex">
								<span class="account">{account}</span>
								{#if action}
									<span class="action">::{action}</span>
								{/if}
							</Contract>
						</dd>
					{/each}
				</div>
			{/if}
		</dl>

		<div class="space-y-4 rounded-b-lg bg-mineShaft-950/50 px-4 py-3 md:rounded-r-lg">
			<Button onclick={addKey}>Add Key</Button>
			<Button onclick={addAccount}>Add Account</Button>
			<Button onclick={addWait}>Add Wait</Button>
			<fieldset class="grid gap-2">
				<Label for="threshold">{m.common_permission_threshold()}</Label>
				<NumberInput
					id="threshold"
					placeholder={m.common_permission_threshold()}
					bind:value={threshold}
				/>
			</fieldset>
			{#if keys.length}
				<table>
					<thead>
						<tr>
							<th>{m.common_permission_weight()}</th>
							<th>{m.common_public_key()}</th>
						</tr>
					</thead>
					<tbody>
						{#each keys as key, index (key)}
							<tr data-hover-effect="false">
								<td>
									<fieldset class="grid gap-2">
										<NumberInput
											min={1}
											bind:value={keys[index].value.weight}
											bind:valid={keys[index].valid.weight}
										/>
									</fieldset>
								</td>
								<td>
									<fieldset class="grid gap-2">
										<PublicKeyInput
											id="key-{index}-key"
											placeholder={m.common_public_key()}
											bind:value={keys[index].value.key}
											bind:valid={keys[index].valid.key}
										/>
									</fieldset>
								</td>
								<td>
									<Button variant="secondary" onclick={() => removeKey(index)}
										>{m.common_remove()}</Button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			{#if accounts.length}
				<table>
					<thead>
						<tr>
							<th>{m.common_permission_weight()}</th>
							<th>{m.common_account_name()}</th>
							<th>{m.common_permission_name()}</th>
							<th>thing</th>
						</tr>
					</thead>
					<tbody>
						{#each accounts as account, index (account)}
							<tr data-hover-effect="false">
								<td>
									<fieldset class="grid gap-2">
										<NumberInput
											min={1}
											placeholder={m.common_permission_weight()}
											bind:value={accounts[index].value.weight}
											bind:valid={accounts[index].valid.weight}
										/>
									</fieldset>
								</td>
								<td>
									<fieldset class="grid gap-2">
										<NameInput
											placeholder={m.common_account()}
											bind:value={accounts[index].value.permission.actor}
											bind:valid={accounts[index].valid.actor}
										/>
									</fieldset>
								</td>
								<td>
									<fieldset class="grid gap-2">
										<NameInput
											placeholder={m.common_permission()}
											bind:value={accounts[index].value.permission.permission}
											bind:valid={accounts[index].valid.permission}
										/>
									</fieldset>
								</td>
								<td>
									<Button variant="secondary" onclick={() => removeAccount(index)}
										>{m.common_remove()}</Button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			{#if waits.length}
				<table>
					<thead>
						<tr>
							<th>{m.common_permission_weight()}</th>
							<th>Wait (Seconds)</th>
						</tr>
					</thead>
					<tbody>
						{#each waits as wait, index (wait)}
							<tr>
								<td>
									<fieldset class="grid gap-2">
										<NumberInput
											placeholder={m.common_permission_weight()}
											min={1}
											bind:value={waits[index].value.weight}
											bind:valid={waits[index].valid.weight}
										/>
									</fieldset>
								</td>
								<td>
									<fieldset class="grid gap-2">
										<NumberInput
											bind:value={waits[index].value.wait_sec}
											bind:valid={waits[index].valid.wait_sec}
										/>
									</fieldset>
								</td>
								<td>
									<Button variant="secondary" onclick={() => removeWait(index)}
										>{m.common_remove()}</Button
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</li>
{/if}

{#if modified}
	<Permission permission={{ permission: modified, children: [] }} />
{/if}

<Button disabled={!allValid} onclick={transact}>Go</Button>

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
