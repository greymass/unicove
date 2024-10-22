<!-- Unstaking balances table. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Card } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import type { UnstakingRecord } from './utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		href?: string;
		records?: Array<UnstakingRecord>;
	}

	const { href, records = [], ...props }: Props = $props();
</script>

<Card {...props} title="Unstaking Balances">
	<table class="table-styles">
		<thead class="border-b-2 border-shark-100/10">
			<tr class="caption font-medium">
				<th class="text-left">Amount</th>
				<th class="text-right">Date available</th>
			</tr>
		</thead>
		<tbody>
			{#each records as record}
				{#if !record.savings}
					<tr>
						<td>{record.balance}</td>
						<td class="text-right">
							{record.date
								? record.date.toLocaleDateString(undefined, {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})
								: '--'}
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
	{#if href}
		<Button {href} variant="secondary" class="text-skyBlue-500">Withdraw</Button>
	{/if}
</Card>
