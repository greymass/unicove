<script lang="ts">
	import Button from '$lib/components/button/button.svelte';

	const { data } = $props();
</script>

<table class="table-styles table-fixed">
	<thead>
		<tr>
			<th class="w-20">ID</th>
			<th>Date</th>
			<th>Action</th>
			<th>Data</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#each data.activityActions as action}
			<tr>
				<td>
					{String(action.id).substring(0, 7)}
				</td>
				<td>
					{action.timestamp.toDate().toLocaleDateString(undefined, {
						weekday: 'long',
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</td>
				<td>
					{action.action}
				</td>
				<td>
					{JSON.stringify(action.data, null, 2)}
				</td>
				<td class="text-right">
					<div class="flex">
						<Button variant="pill" href="/{data.network}/transaction/{action.id}">detail</Button>
						<Button variant="pill" href="/{data.network}/transaction/{action.id}/{action.seq}"
							>seq</Button
						>
					</div>
				</td>
			</tr>
		{/each}
	</tbody>
</table>
