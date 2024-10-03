<script>
	import { Stack } from '$lib/components/layout';
	import * as Table from '$lib/components/table';

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

		<Table.Root>
			<Table.Head>
				<Table.Row>
					<Table.Header class="w-max">Col 1</Table.Header>
					<Table.Header>Column 2</Table.Header>
					<Table.Header>Column 3</Table.Header>
					<Table.Header>Column 4</Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{#each options as option}
					<Table.Row>
						<Table.Cell>{option[0]}</Table.Cell>
						<Table.Cell>{option[1]}</Table.Cell>
						<Table.Cell>{option[2]}</Table.Cell>
						<Table.Cell>{option[3]}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Stack>

	<Stack>
		<h3 class="h3">Fixed width columns (even)</h3>
		<Table.Root fixed>
			<Table.Head>
				<Table.Row>
					<Table.Header>Col 1</Table.Header>
					<Table.Header>Column 2</Table.Header>
					<Table.Header>Column 3</Table.Header>
					<Table.Header>Column 4</Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{#each options as option}
					<Table.Row>
						<Table.Cell>{option[0]}</Table.Cell>
						<Table.Cell>{option[1]}</Table.Cell>
						<Table.Cell>{option[2]}</Table.Cell>
						<Table.Cell>{option[3]}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Stack>

	<Stack>
		<h3 class="h3">Fixed width columns (modified width)</h3>
		<Table.Root fixed>
			<Table.Head>
				<Table.Row>
					<Table.Header class="w-20">Small 1</Table.Header>
					<Table.Header>Column 2</Table.Header>
					<Table.Header>Column 3</Table.Header>
					<Table.Header>Column 4</Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{#each options as option}
					<Table.Row>
						<Table.Cell>{option[0]}</Table.Cell>
						<Table.Cell>{option[1]}</Table.Cell>
						<Table.Cell>{option[2]}</Table.Cell>
						<Table.Cell>{option[3]}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Stack>

	<Stack>
		<h3 class="h3">Table with different alignments</h3>
		<Table.Root>
			<Table.Head>
				<Table.Row>
					<Table.Header class="text-left">Left</Table.Header>
					<Table.Header class="text-center">Center</Table.Header>
					<Table.Header class="text-right">Right</Table.Header>
				</Table.Row>
			</Table.Head>
			<Table.Body>
				{#each [1, 2, 3, 4] as index}
					<Table.Row id={String(index)}>
						<Table.Cell class="border-r border-white/10 text-left">Left</Table.Cell>
						<Table.Cell class="border-r border-white/10 text-center">Center</Table.Cell>
						<Table.Cell class="text-right">Right</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Stack>
</Stack>
