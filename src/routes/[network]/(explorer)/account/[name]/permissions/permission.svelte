<script lang="ts">
	import Self from './permission.svelte';
	import type { TreePermission } from './+page';
	import Key from '$lib/components/elements/key.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import Account from '$lib/components/elements/account.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration'; // ES 2015
	import relativeTime from 'dayjs/plugin/relativeTime'; // ES 2015
	import { Clock } from 'lucide-svelte';
	dayjs.extend(duration);
	dayjs.extend(relativeTime);
	interface Props {
		permission: TreePermission;
		level?: number;
	}
	let { level = 0, ...props }: Props = $props();
	let { permission, children } = $derived(props.permission);
	$inspect(permission);
	const anyPermissions = $derived(
		permission.required_auth.accounts.length ||
			permission.required_auth.keys.length ||
			permission.required_auth.waits.length
	);
</script>

<li
	class="relative col-span-full grid grid-cols-subgrid bg-shark-950"
	class:pl-4={level !== 0}
	class:pt-6={level !== 0}
>
	<dl
		class="z-20 col-span-full space-y-1 rounded-t-lg bg-mineShaft-950 px-4 py-3 md:col-span-1 md:rounded-l-lg"
	>
		<div>
			<dt class="sr-only">Permission Name</dt>
			<dd class="text-xl font-semibold text-white">{permission.perm_name}</dd>
		</div>
		<div class="text-muted text-nowrap *:inline">
			<dt class="after:content-[':']"><span class="sr-only">Threshold</span> Required</dt>
			<dd>{permission.required_auth.threshold}</dd>
		</div>
		{#if permission.linked_actions}
			<div class="">
				<dt class="sr-only">Actions</dt>
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

	<div class="rounded-b-lg bg-mineShaft-950/50 px-4 py-3 md:rounded-r-lg">
		{#if anyPermissions}
			<table class="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2">
				<thead class="col-span-full grid grid-cols-subgrid">
					<tr
						class="col-span-full grid grid-cols-subgrid text-left *:pt-1 *:text-base *:font-medium"
					>
						<th>Weight</th>
						<th>Authorization</th>
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
								<td>
									<CopyButton data={key.toString()} slop={false} />
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
									<CopyButton data={account.toString()} slop={false} />
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
								<td class="flex items-center gap-2 text-mineShaft-100">
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
			class="children col-span-full grid grid-cols-subgrid *:data-[solo=false]:border-l last:*:data-[solo=false]:border-transparent"
			style={`margin-left:calc(1rem * ${level + 1})`}
		>
			{#each children as child}
				<Self permission={child} level={level + 1} />
			{/each}
		</ul>
	</li>
{/if}
