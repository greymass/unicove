<script lang="ts">
	import Self from './permission.svelte';
	import type { TreePermission } from './+page';
	import { Permission } from '@wharfkit/account';
	import Key from '$lib/components/elements/key.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import { cn } from '$lib/utils';
	interface Props {
		permission: TreePermission;
		level?: number;
	}
	let { level = 0, ...props }: Props = $props();
	let { permission, children } = $derived(props.permission);
</script>

{#if children}
	{@render permissionItem(permission)}
	{#each children as child}
		<!-- <p>counting down...</p> -->
		<Self permission={child} level={level + 1} />
	{/each}
{:else}
	{@render permissionItem(permission)}
{/if}

{#snippet permissionItem(p: Permission)}
	<div class="col-span-full grid grid-cols-subgrid">
		<dl
			class="space-y-1 rounded-l-lg bg-mineShaft-700/20 px-4 py-3"
			style="margin-left:calc(3 * {level}rem)"
		>
			<div>
				<dt class="sr-only">Permission Name</dt>
				<dd class="text-xl font-semibold">{p.perm_name}</dd>
			</div>
			<div class="text-muted *:inline">
				<dt class="after:content-[':']">Required</dt>
				<dd>{p.required_auth.threshold}</dd>
			</div>
		</dl>

		<div class="rounded-r-lg bg-mineShaft-700/10 px-4 py-3">
			<table class="table-styles">
				<thead>
					<tr class="text-left *:pt-1">
						<th>Weight</th>
						<th>Key</th>
					</tr>
				</thead>
				<tbody>
					{#each p.required_auth.keys as { weight, key }}
						<tr class="table-row-border" data-hover-effect="false">
							<td>
								+{weight.toString()}
							</td>
							<td>
								<Key {key} />
							</td>
							<td>
								<CopyButton data={key.toString()} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/snippet}
