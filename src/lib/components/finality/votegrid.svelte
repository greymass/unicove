<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { FinalizerStats } from '$lib/state/finality/derive';
	import { baselineCovered, gridCellMarked } from '$lib/state/finality/markers';
	import type { BaselineGridCell, BaselineMessage } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';
	import ExplorerLink from './explorerlink.svelte';
	import { formatShare } from './labels.svelte';

	interface Props {
		finalizers: FinalizerStats[];
		producers: string[];
		baseline: BaselineMessage | null;
	}

	const { finalizers, producers, baseline }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const covered = $derived(baselineCovered(baseline));
	const cells = $derived(
		new Map((baseline?.grid ?? []).map((cell) => [`${cell.public_key}|${cell.producer}`, cell]))
	);
	const entries = $derived(new Map((baseline?.finalizers ?? []).map((e) => [e.public_key, e])));
	const tests = $derived(finalizers.length * producers.length);

	function tip(description: string, producer: string, cell: BaselineGridCell | undefined): string {
		const share = formatShare(cell?.missing ?? 0, cell?.qcs ?? 0, locale);
		const total = formatNumber(cell?.qcs ?? 0, locale);
		// @wc-include
		return `${description} missing from ${share} of ${total} QCs in ${producer}'s blocks`;
	}
</script>

{#if !covered}
	<p class="text-muted text-sm">Building baseline</p>
{:else}
	<div class="grid gap-2">
		<div class="overflow-x-auto">
			<table class="font-mono text-[11px]">
				<thead>
					<tr>
						<th
							class="bg-surface text-muted sticky left-0 z-[1] pr-2 text-left align-bottom font-sans font-normal"
						>
							Finalizer \ QC block producer
						</th>
						{#each producers as producer (producer)}
							<th
								class="text-muted h-24 rotate-180 px-0.5 align-bottom font-normal [writing-mode:vertical-rl]"
							>
								<ExplorerLink account={producer} />
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each finalizers as row (row.public_key)}
						<tr>
							<td class="bg-surface sticky left-0 z-[1] pr-2 whitespace-nowrap"
								><ExplorerLink account={row.description} /></td
							>
							{#each producers as producer (producer)}
								{@const cell = cells.get(`${row.public_key}|${producer}`)}
								{@const rate = cell && cell.qcs ? cell.missing / cell.qcs : 0}
								{@const marked = !!cell && gridCellMarked(cell, entries.get(row.public_key), tests)}
								<td
									class="border-surface h-[18px] w-[22px] border p-0"
									title={tip(row.description, producer, cell)}
								>
									<div
										class="size-full {marked
											? 'shadow-[inset_0_0_0_2px_var(--color-warning)]'
											: ''}"
										style:background="color-mix(in oklab, var(--color-primary) {Math.round(
											Math.min(1, rate * 1.6) * 100
										)}%, var(--color-surface-container))"
									></div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="text-muted text-xs">
			Missing-vote share by QC block producer over the 24 h baseline; a stronger shade is more
			missing. An outlined cell is missing more votes than that finalizer's own baseline rate makes
			likely. nodeos logs the same absence as "Block #n produced by p has no votes for block #m from
			finalizers".
		</p>
	</div>
{/if}
