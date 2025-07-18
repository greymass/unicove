<!-- Unstaking balances table. -->

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Card, Stack, Table, TD, TH, TR } from 'unicove-components';
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
		<Stack>
			<p>
				{m.unstaking_description()}
			</p>
			<Table>
				{#snippet thead()}
					<TH class="text-left">{m.common_amount()}</TH>
					<TH class="text-right">{m.common_date_available()}</TH>
				{/snippet}

				{#each records as record}
					{#if !record.savings}
						<TR>
							<TD><AssetText variant="full" value={record.balance} /></TD>
							<TD class="text-right">
								{record.date ? record.date.toLocaleTimeString(languageTag()) : '--'}
								{record.date ? record.date.toLocaleDateString(languageTag()) : '--'}
							</TD>
						</TR>
					{/if}
				{/each}
			</Table>
			{#if href}
				<Button {href} variant="secondary">{m.common_withdraw()}</Button>
			{/if}
		</Stack>
	</Card>
{/if}
