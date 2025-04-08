<script lang="ts">
	import type { ABI, Name } from '@wharfkit/antelope';
	import Braces from 'lucide-svelte/icons/braces';

	import Contract from '$lib/components/elements/contract.svelte';
	import { parseRootType } from '$lib/utils/abi';

	interface Props {
		abi: ABI;
		contract: Name;
		struct: ABI.Struct;
	}
	let { abi, contract, struct }: Props = $props();
</script>

{#if struct}
	<table class="table-styles">
		<thead>
			<tr>
				<th colspan="2" class="flex items-center text-lg font-bold">
					Request Parameters
					<Braces class="ml-2 inline" />
				</th>
			</tr>
		</thead>
		<tbody>
			{#each struct.fields as field}
				{@const fieldType = abi.structs.find((s) => s.name === parseRootType(field.type))}
				<tr>
					<td>
						<span class="text-on-surface">
							{field.name}
						</span>
					</td>
					<td>
						{#if fieldType}
							<Contract name={contract} struct={fieldType.name}>
								{field.type}
							</Contract>
						{:else}
							{field.type}
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td class="text-muted" colspan="2"> No action parameters. </td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
