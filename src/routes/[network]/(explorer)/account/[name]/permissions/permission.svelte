<script lang="ts">
	import Self from './permission.svelte';
	import type { TreePermission } from './+page';
	import Key from '$lib/components/elements/key.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	interface Props {
		permission: TreePermission;
		level?: number;
	}
	let { level = 0, ...props }: Props = $props();
	let { permission, children } = $derived(props.permission);
</script>

<li
	class="relative col-span-full grid grid-cols-subgrid bg-shark-950 pt-6"
	class:pl-4={level !== 0}
>
	<dl class="z-20 space-y-1 rounded-l-lg bg-mineShaft-950 px-4 py-3">
		<div>
			<dt class="sr-only">Permission Name</dt>
			<dd class="text-xl font-semibold text-white">{permission.perm_name}</dd>
		</div>
		<div class="text-muted *:inline">
			<dt class="after:content-[':']">Required</dt>
			<dd>{permission.required_auth.threshold}</dd>
		</div>
	</dl>

	<div class="rounded-r-lg bg-mineShaft-950/50 px-4 py-3">
		<table class="table-styles">
			<thead>
				<tr class="text-left *:pt-1">
					<th>Weight</th>
					<th>Key</th>
				</tr>
			</thead>
			<tbody>
				{#each permission.required_auth.keys as { weight, key }}
					<tr class="table-row-border text-white" data-hover-effect="false">
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
