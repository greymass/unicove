<script lang="ts">
	import { ABI } from '@wharfkit/antelope';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import Account from '$lib/components/link/account.svelte';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { data } = $props();

	const tableDef = data.abi.tables.find((t: ABI.Table) => t.name === data.table);
	const struct = data.abi.structs.find((s: ABI.Struct) => s.name === tableDef.type);
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
		<thead>
			{#each struct.fields as field}
				<th>{field.name}</th>
			{/each}
		</thead>
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

<pre>{JSON.stringify(data, null, 2)}</pre>
