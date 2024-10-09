<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Stack from '$lib/components/layout/stack.svelte';
	import Pageheader from '$lib/components/pageheader.svelte';

	const { data } = $props();
</script>

<Stack>
	<Pageheader
		title={m.contract_tables_view_title({
			table: data.table
		})}
		subtitle={m.contract_tables_view_description({
			contract: String(data.contract),
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
