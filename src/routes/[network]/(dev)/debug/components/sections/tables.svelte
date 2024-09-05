<script>
	import { Stack } from '$lib/components/layout';
	import * as Table from '$lib/components/table';

	const options = [
		['Row 1', 'Row 1, Column 2', 'Row 1, Column 3', 'Row 1, Column 4'],
		['Row 2', 'Row 2, Column 2', 'Row 2, Column 3', 'Row 2, Column 4'],
		['Row 3', 'Row 3, Column 2', 'Row 3, Column 3', 'Row 3, Column 4'],
		['Row 4', 'Row 4, Column 2', 'Row 4, Column 3', 'Row 4, Column 4']
	];
</script>

<Stack id="tables" class="gap-8">
	<h2 class="h2">Tables</h2>

	<Stack>
		<h3 class="h3">Basic table</h3>

		<Table.Root>
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
						{#each option as value}
							<Table.Cell>{value}</Table.Cell>
						{/each}
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
				{#each [1, 2, 3, 4] as _value}
					<Table.Row>
						<Table.Cell class="border-r border-white/10 text-left">Left</Table.Cell>
						<Table.Cell class="border-r border-white/10 text-center">Center</Table.Cell>
						<Table.Cell class="text-right">Right</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Stack>
</Stack>
