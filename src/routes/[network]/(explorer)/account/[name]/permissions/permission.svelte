<script lang="ts">
	import Self from './permission.svelte';
	import Key from '$lib/components/elements/key.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import dayjs from 'dayjs';
	import { Clock, Edit, LogIn } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import { Name, PermissionLevel, UInt64 } from '@wharfkit/antelope';
	import type { TreePermission } from './+page';

	interface Props {
		account: Name;
		advancedMode: boolean;
		currentUser: boolean;
		loggedIn: boolean;
		msigMode: boolean;
		signin: (auth: PermissionLevel) => Promise<void>;
		permission: TreePermission;
		level?: number;
	}
	let {
		account,
		advancedMode,
		currentUser,
		loggedIn,
		msigMode,
		signin,
		level = 0,
		...props
	}: Props = $props();
	let { permission, children } = $derived(props.permission);

	const anyPermissions = $derived(
		permission.required_auth.accounts.length ||
			permission.required_auth.keys.length ||
			permission.required_auth.waits.length
	);
	const isMSIG = $derived(permission.required_auth.threshold.gt(UInt64.from(1)));

	const editUrl = $derived('permissions/' + permission.perm_name);
</script>

<li
	class="bg-shark-950 relative col-span-full grid grid-cols-subgrid"
	class:pl-4={level !== 0}
	class:pt-6={level !== 0}
>
	<dl
		class="bg-mine-950 z-20 col-span-full space-y-1 rounded-t-lg px-4 py-3 md:col-span-1 md:rounded-l-lg md:rounded-r-none"
	>
		<div>
			<dt class="sr-only">{m.common_permission_name()}</dt>
			<dd class="text-xl font-semibold text-white">
				<div class="flex items-center gap-2">
					{permission.perm_name}
					{#if isMSIG && advancedMode && loggedIn && !msigMode}
						<LogIn
							onclick={() =>
								signin(PermissionLevel.from({ actor: account, permission: permission.perm_name }))}
							class="text-muted size-4 hover:text-white"
						/>
					{/if}
				</div>
			</dd>
		</div>
		<div class="text-muted text-nowrap *:inline">
			<dt class="after:content-[':']">
				<span class="sr-only">{m.common_permission_threshold()}</span>
				{m.common_required()}
			</dt>
			<dd>{permission.required_auth.threshold}</dd>
		</div>
		{#if permission.linked_actions}
			<div class="">
				<dt class="sr-only">{m.common_actions()}</dt>
				{#each permission.linked_actions as { action, account }}
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

	<div class="bg-mine-950/50 rounded-b-lg px-4 py-3 md:rounded-l-none md:rounded-r-lg">
		{#if anyPermissions}
			<table class="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2">
				<thead class="col-span-full grid grid-cols-subgrid">
					<tr
						class="col-span-full grid grid-cols-subgrid text-left *:pt-1 *:text-base *:font-medium"
					>
						<th>{m.common_permission_weight()}</th>
						<th>{m.common_permission_authorization()}</th>
						<th class="flex items-center gap-2">
							{#if loggedIn && currentUser}
								<a href={editUrl}>
									<Edit class="size-4" />
								</a>
							{/if}
						</th>
					</tr>
				</thead>
				<tbody class="col-span-full grid grid-cols-subgrid gap-x-4 gap-y-2">
					{#if permission.required_auth.keys}
						{#each permission.required_auth.keys as { weight, key }}
							<tr
								class="col-span-full grid grid-cols-subgrid items-start bg-none text-white"
								data-hover-effect="false"
							>
								<td>
									+{weight.toString()}
								</td>
								<td>
									<Key {key} icon />
								</td>
								<td class="grid h-full items-center justify-items-end">
									<CopyButton data={key.toString()} />
								</td>
							</tr>
						{/each}
					{/if}
					{#if permission.required_auth.accounts}
						{#each permission.required_auth.accounts as { weight, permission: account }}
							<tr
								class="col-span-full grid grid-cols-subgrid bg-none text-white"
								data-hover-effect="false"
							>
								<td>
									+{weight.toString()}
								</td>
								<td>
									<Account name={account.actor} icon>
										{account}
									</Account>
								</td>
								<td class="*:pt-1">
									<CopyButton data={account.toString()} />
								</td>
							</tr>
						{/each}
					{/if}
					{#if permission.required_auth.waits}
						{#each permission.required_auth.waits as { weight, wait_sec }}
							<tr
								class="col-span-full grid grid-cols-subgrid bg-none text-white"
								data-hover-effect="false"
							>
								<td>
									+{weight.toString()}
								</td>
								<td class="text-mine-100 flex items-center gap-2">
									<Clock class="size-4" />
									{wait_sec.toString()}s ({dayjs
										.duration(wait_sec.toNumber(), 'seconds')
										.humanize()})
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		{/if}
	</div>
	<!-- The curved connector line -->
	{#if level > 0}
		<div class="absolute -left-px z-10 size-12 rounded-bl-xl border-b border-l"></div>
	{/if}
</li>

{#if children}
	<li class="col-span-full grid grid-cols-subgrid">
		<!-- The border on this ul is the through line -->
		<ul
			data-solo={children.length === 1}
			class="children col-span-full grid grid-cols-subgrid data-[solo=false]:*:border-l data-[solo=false]:*:last:border-transparent"
			class:ml-8={level > 0}
			class:ml-4={level === 0}
		>
			<!-- style={`margin-left:calc(1rem * ${level + 1})`} -->
			{#each children as child}
				<Self
					{account}
					{advancedMode}
					{currentUser}
					{loggedIn}
					{msigMode}
					{signin}
					permission={child}
					level={level + 1}
				/>
			{/each}
		</ul>
	</li>
{/if}
