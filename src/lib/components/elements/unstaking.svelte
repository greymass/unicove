<!-- Unstaking balances table. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Card } from '$lib/components/layout';
	import Button from '$lib/components/button/button.svelte';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import { languageTag } from '$lib/paraglide/runtime';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		href?: string;
		records?: Array<UnstakingRecord>;
	}

	const { href, records = [], ...props }: Props = $props();
</script>

{#if records.filter((r) => !r.savings).length > 0}
	<Card {...props} title="Unstaking" class="auto-rows-max">
		<p>
			The tokens currently being unstaked are listed below with the date they become available.
			These balances will continue to earn rewards until they are withdrawn.
		</p>
		<table class="table-styles mt-4">
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
							<td><AssetText variant="full" value={record.balance} /></td>
							<td class="text-right">
								{record.date ? record.date.toLocaleTimeString(languageTag()) : '--'}
								{record.date ? record.date.toLocaleDateString(languageTag()) : '--'}
							</td>
						</tr>
					{/if}
				{/each}
			</tbody>
		</table>
		{#if href}
			<Button {href} variant="secondary">Withdraw</Button>
		{/if}
	</Card>
{/if}
