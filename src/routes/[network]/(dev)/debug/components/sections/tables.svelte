<script>
	import { DD, DL, DLRow } from 'unicove-components';
	import Account from '$lib/components/elements/account.svelte';
	import { Card, Stack } from 'unicove-components';

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

	const items = [
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' },
		{ title: 'Some title', description: '123456' }
	];
</script>

<Stack id="tables" class="gap-8">
	<h2 class="h2">Tables and table-like displays</h2>

	<Stack>
		<h3 class="h3">Description List</h3>

		<p>
			For a simple two-column key-value type table we can use the description list component. This
			will collapse the value under the key and right-align it on smaller screens. Note there is no
			row striping here.
		</p>

		<Card class="max-w-md" title="Some items">
			<DL {items} />
		</Card>

		<p>
			For displaying a component in the description, or multiple values under a single key, you can
			use the components declaratively.
		</p>

		<p>
			Note: You need to wrap the child component correctly or you'll get a warning. There are CSS
			rules that'll visually yell at you to fix it :)
		</p>

		<div class="max-w-md">
			<DL>
				<DLRow title="First">
					<DD>
						<Account name={'teamgreymass'} />
					</DD>
				</DLRow>
				<DLRow title="Second">
					<DD>
						<Account name={'unicove.gm'} />
					</DD>
					<DD>
						<Account name={'test.gm'} />
					</DD>
				</DLRow>
				<DLRow title="Warning">
					<Account name={'unicove.gm'} />
				</DLRow>
			</DL>
		</div>
	</Stack>

	<Stack>
		<h3 class="h3">Basic table (auto width columns)</h3>

		<p>
			For data that should remain in a table format at all breakpoints we can use the table element
			with the `table-styles` class.
		</p>

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

	<Stack>
		<h3 class="h3">Table with alternative layouts at different breakpoints</h3>

		<p>
			For data that cannot be displayed in multi-column format at all screen sizes, we'll need a
			different approach. This will be custom to the particular component or page where the data is
			being displayed.
		</p>

		<p>For example, a table on desktop that collapses to a card view on mobile.</p>

		<p>
			Implementation: It will probably be a wrapping `@container` giving the child `grid` context a
			container query to work with to define breakpoints, then a `subgrid` on each row to define
			consistent columns.
		</p>

		<!-- TODO: Example  -->
	</Stack>
</Stack>
