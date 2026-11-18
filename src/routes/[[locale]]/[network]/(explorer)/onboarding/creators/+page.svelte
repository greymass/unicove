<script lang="ts">
	import { getContext } from 'svelte';
	import { Card } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { GiftProgram } from '$lib/state/creationindex/giftprogram.svelte';
	import {
		OBSERVED_DAYS,
		YEAR_DAYS,
		chainTime,
		creatorTotals,
		usedNow
	} from '$lib/state/creationindex/onboarding';
	import Status from '$lib/components/onboarding/status.svelte';
	import { formatBytes } from '$lib/utils/bytes';
	import { formatDateTime, formatNumber } from '$lib/utils/intl';

	const context = getContext<UnicoveContext>('state');
	const program = getContext<GiftProgram>('giftprogram');
	const locale = $derived(context.settings.data.locale);

	const date = (time: string) =>
		formatDateTime(new Date(chainTime(time)), locale, {
			dateStyle: 'medium',
			timeStyle: undefined
		});
</script>

<Card>
	<div class="overflow-x-auto">
		<table class="w-full text-sm">
			<thead class="text-muted text-left">
				<tr class="border-outline border-b">
					<th class="py-2 font-normal">Creator</th>
					<th class="py-2 font-normal">Registered</th>
					<th class="py-2 text-right font-normal">Daily quota</th>
					<th class="py-2 text-right font-normal">Used this window</th>
					<th class="py-2 text-right font-normal">Gifts, {OBSERVED_DAYS} days</th>
					<th class="py-2 text-right font-normal">Gifted, 1 year</th>
					<th class="py-2"></th>
				</tr>
			</thead>
			<tbody>
				{#each program.listing as creator (creator.name)}
					<tr class="border-outline/50 border-b">
						<td class="py-2">
							<a
								class="text-primary"
								href={context.urlPath(`/onboarding/creators/${creator.name}`)}
							>
								{creator.name}
							</a>
						</td>
						<td class="text-muted py-2">{creator.registered ? date(creator.registered) : ''}</td>
						<td class="py-2 text-right font-mono tabular-nums">
							{creator.row ? formatBytes(creator.row.daily_quota_bytes) : ''}
						</td>
						<td class="py-2 text-right font-mono tabular-nums">
							{creator.row ? formatBytes(usedNow(creator.row, program.now)) : ''}
						</td>
						<td class="py-2 text-right tabular-nums">
							{formatNumber(
								creatorTotals(program.daily, creator.name, OBSERVED_DAYS, program.now).gifts,
								locale
							)}
						</td>
						<td class="py-2 text-right font-mono tabular-nums">
							{formatBytes(
								creatorTotals(program.daily, creator.name, YEAR_DAYS, program.now).bytes
							)}
						</td>
						<td class="py-2 text-right">
							<Status
								suspended={creator.row?.suspended}
								enabled={program.enabled}
								removed={!creator.row}
							/>
						</td>
					</tr>
				{:else}
					<tr><td colspan="7" class="text-muted py-2">No creator has registered yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</Card>
