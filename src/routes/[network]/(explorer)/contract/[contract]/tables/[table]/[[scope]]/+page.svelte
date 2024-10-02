<script lang="ts">
	import { ABI } from '@wharfkit/antelope';
	import * as m from '$lib/paraglide/messages.js';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { data } = $props();

	const tableDef = data.abi.tables.find((t: ABI.Table) => t.name === data.table);
</script>

<Stack>
	<Pageheader
		title={m.contract_tables_view_title({
			table: data.table
		})}
		subtitle={m.contract_tables_view_description({
			contract: data.contract,
			network: data.network.chain.name,
			table: data.table
		})}
	/>
	<table>
		<tbody>
			{#each data.rows as row}
				<tr>
					{#each Object.keys(row) as key}
						<td>
							{JSON.stringify(row[key], null, 2)}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</Stack>
