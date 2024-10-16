<script lang="ts">
	const { data } = $props();
</script>

<table class="table-styles table-fixed">
	<thead>
		<tr>
			<th class="w-20">ID</th>
			<th>Date</th>
			<th>Action</th>
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
					{action.action}
				</td>
				<td>
					{JSON.stringify(action.data, null, 2)}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
