<script>
	import { Stack } from '$lib/components/layout';

	const options = [
		[
			'Row 1',
			'Row 1, Column 2 is a really long column that shows how wrapping works',
			'Row 1, Column 3',
			'Row 1, Column 4'
		],
		[
			'Row 2',
			'Row 2, Column 2 is a really long column that shows how wrapping works',
			'Row 2, Column 3',
			'Row 2, Column 4'
		],
		[
			'Row 3',
			'Row 3, Column 2 is a really long column that shows how wrapping works',
			'Row 3, Column 3',
			'Row 3, Column 4'
		],
		[
			'Row 4',
			'Row 4, Column 2 is a really long column that shows how wrapping works',
			'Row 4, Column 3',
			'Row 4, Column 4'
		]
	];
</script>

<Stack id="tables" class="gap-8">
	<h2 class="h2">Tables</h2>

	<Stack>
		<h3 class="h3">Basic table (auto width columns)</h3>

		<table class="table-styles">
			<thead>
				<tr>
					<th>Col 1</th>
					<th>Column 2</th>
					<th>Column 3</th>
					<th>Column 4</th>
				</tr>
			</thead>
			<tbody>
				{#each options as option}
					<tr>
						<td>{option[0]}</td>
						<td>{option[1]}</td>
						<td>{option[2]}</td>
						<td>{option[3]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>

	<Stack>
		<h3 class="h3">Fixed width columns (even)</h3>
		<table class="table-styles table-fixed">
			<thead>
				<tr>
					<th>Col 1</th>
					<th>Column 2</th>
					<th>Column 3</th>
					<th>Column 4</th>
				</tr>
			</thead>
			<tbody>
				{#each options as option}
					<tr>
						<td>{option[0]}</td>
						<td>{option[1]}</td>
						<td>{option[2]}</td>
						<td>{option[3]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>

	<Stack>
		<h3 class="h3">Fixed width columns (modified width)</h3>
		<p>Hover effect disabled</p>
		<table class="table-styles table-fixed">
			<thead>
				<tr>
					<th class="w-20">Small 1</th>
					<th>Column 2</th>
					<th>Column 3</th>
					<th>Column 4</th>
				</tr>
			</thead>
			<tbody>
				{#each options as option}
					<tr data-hover-effect={false}>
						<td>{option[0]}</td>
						<td>{option[1]}</td>
						<td>{option[2]}</td>
						<td>{option[3]}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>

	<Stack>
		<h3 class="h3">Table with different alignments</h3>
		<table class="table-styles">
			<thead>
				<tr>
					<th class="text-left">Left</th>
					<th class="text-center">Center</th>
					<th class="text-right">Right</th>
				</tr>
			</thead>
			<tbody>
				{#each [1, 2, 3, 4] as index}
					<tr id={String(index)}>
						<td class="border-r border-white/10 text-left">Left</td>
						<td class="border-r border-white/10 text-center">Center</td>
						<td class="text-right">Right</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</Stack>
</Stack>
