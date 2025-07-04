<!-- Unstaking balances table. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Card } from 'unicove-components';
	import { Button } from 'unicove-components';
	import type { UnstakingRecord } from '$lib/utils/staking';
	import { languageTag } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		href?: string;
		records?: Array<UnstakingRecord>;
	}

	const { href, records = [], ...props }: Props = $props();
</script>

{#if records.filter((r) => !r.savings).length > 0}
	<Card {...props} title={m.common_unstaking()} class="auto-rows-max">
		<p>
			{m.unstaking_description()}
		</p>
		<table class="table-styles mt-4">
			<thead class="">
				<tr class="caption font-medium">
					<th class="text-left">{m.common_amount()}</th>
					<th class="text-right">{m.common_date_available()}</th>
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
			<Button {href} variant="secondary">{m.common_withdraw()}</Button>
		{/if}
	</Card>
{/if}
