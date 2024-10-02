<!-- Unstaking balances table. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { Card } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import * as Table from '$lib/components/table';

	import type { UnstakingRecord } from './utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		href?: string;
		records?: Array<UnstakingRecord>;
	}

	const { href, records = [], ...props }: Props = $props();
</script>

<Card {...props} title="Unstaking Balances">
	<Table.Root class="table-auto">
		<Table.Head class="border-b-2 border-shark-100/10">
			<Table.Row class="caption font-medium">
				<Table.Header class="text-left">Amount</Table.Header>
				<Table.Header class="text-right">Date available</Table.Header>
			</Table.Row>
		</Table.Head>
		<Table.Body>
			{#each records as record}
				{#if !record.savings}
					<Table.Row>
						<Table.Cell>{record.balance}</Table.Cell>
						<Table.Cell class="text-right">
							{record.date
								? record.date.toLocaleDateString(undefined, {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})
								: '--'}
						</Table.Cell>
					</Table.Row>
				{/if}
			{/each}
		</Table.Body>
	</Table.Root>
	{#if href}
		<Button {href} variant="secondary" class="text-skyBlue-500">Withdraw</Button>
	{/if}
</Card>
