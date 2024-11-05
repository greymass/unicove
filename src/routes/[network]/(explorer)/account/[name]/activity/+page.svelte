<script lang="ts">
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

<table class="table-styles table-fixed">
	<thead>
		<tr>
			<th class="w-20">ID</th>
			<th class="w-40">Date</th>
			<th class="w-40">Action</th>
			<th>Data</th>
		</tr>
	</thead>
	<tbody>
		{#each data.activityActions as action}
			<tr>
				<td>
					<a href="/{data.network}/transaction/{action.id}">{String(action.id).substring(0, 7)}</a>
				</td>
				<td>
					{action.timestamp.toDate().toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						second: 'numeric'
					})}
				</td>
				<td>
					<p>{action.contract}</p>
					{action.action}
				</td>
				<td>
					<Code>{JSON.stringify(action.data, null, 2)}</Code>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
