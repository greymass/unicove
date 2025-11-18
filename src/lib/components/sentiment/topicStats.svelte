<script lang="ts">
	import { Card } from 'unicove-components';
	import { Number as NumberFormat } from 'unicove-components';
	import type { TopicStatistics } from '$lib/types/sentiment';
	import AssetText from '$lib/components/elements/asset.svelte';
	import ThumbsUp from '@lucide/svelte/icons/thumbs-up';
	import ThumbsDown from '@lucide/svelte/icons/thumbs-down';
	import Users from '@lucide/svelte/icons/users';
	import Weight from '@lucide/svelte/icons/scale';

	interface Props {
		statistics: TopicStatistics;
		loading?: boolean;
		class?: string;
	}

	const { statistics, loading = false, class: className }: Props = $props();
</script>

<div class="@container relative grid gap-4 {className}">
	{#if loading}
		<div
			class="bg-surface/40 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg backdrop-blur-[2px]"
		>
			<svg class="text-primary size-12 animate-spin" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<p class="text-on-surface text-sm font-medium">Updating Data</p>
		</div>
	{/if}

	<div class="grid gap-4 @lg:grid-cols-3">
		<Card>
			<div class="flex items-center justify-between gap-4">
				<Weight class="text-primary size-12 shrink-0" />
				<div class="flex-1">
					<p class="text-on-surface-variant text-right text-sm">Total Weight</p>
					<p class="text-on-surface mt-1 text-right text-2xl font-bold">
						<AssetText variant="short" value={statistics.totalWeightAsset} />
					</p>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center justify-between gap-4">
				<Weight class="text-success size-12 shrink-0" />
				<div class="flex-1">
					<p class="text-on-surface-variant text-right text-sm">Support Weight</p>
					<p class="text-success mt-1 text-right text-2xl font-bold">
						<AssetText variant="short" value={statistics.totalSupportWeightAsset} />
					</p>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center justify-between gap-4">
				<Weight class="text-error size-12 shrink-0" />
				<div class="flex-1">
					<p class="text-on-surface-variant text-right text-sm">Opposition Weight</p>
					<p class="text-error mt-1 text-right text-2xl font-bold">
						<AssetText variant="short" value={statistics.totalOppositionWeightAsset} />
					</p>
				</div>
			</div>
		</Card>
	</div>

	<Card>
		<h3 class="text-on-surface mb-3 text-sm font-semibold">Vote Distribution</h3>
		<div class="space-y-3">
			<div class="bg-surface-container flex h-4 overflow-hidden rounded-full">
				{#if statistics.supportPercentage > 0}
					<div class="bg-success" style="width: {statistics.supportPercentage}%"></div>
				{/if}
				{#if statistics.oppositionPercentage > 0}
					<div class="bg-error" style="width: {statistics.oppositionPercentage}%"></div>
				{/if}
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-success font-semibold">{statistics.supportPercentage}% Support</span>
				<span class="text-error font-semibold">{statistics.oppositionPercentage}% Oppose</span>
			</div>
		</div>
	</Card>

	<div class="grid gap-4 @lg:grid-cols-3">
		<Card>
			<div class="flex items-center justify-between gap-4">
				<Users class="text-primary size-14 shrink-0" />
				<div class="flex-1">
					<p class="text-on-surface-variant text-right text-sm">Participants</p>
					<p class="text-on-surface mt-1 text-right text-2xl font-bold">
						<NumberFormat number={statistics.totalVotes} />
					</p>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center justify-between gap-4">
				<ThumbsUp class="text-success size-12 shrink-0" />
				<div class="flex-1">
					<p class="text-on-surface-variant text-right text-sm">Support</p>
					<p class="text-success mt-1 text-right text-2xl font-bold">
						<NumberFormat number={statistics.supportVotes} />
					</p>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center justify-between gap-4">
				<ThumbsDown class="text-error size-12 shrink-0" />
				<div class="flex-1">
					<p class="text-on-surface-variant text-right text-sm">Oppose</p>
					<p class="text-error mt-1 text-right text-2xl font-bold">
						<NumberFormat number={statistics.oppositionVotes} />
					</p>
				</div>
			</div>
		</Card>
	</div>
</div>
