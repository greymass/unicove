<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';

	const { data } = $props();
</script>

<Stack>
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
