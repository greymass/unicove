import type { StageStatus } from '$lib/state/finality/derive';
import { BASELINE_COVERAGE_MINUTES } from '$lib/state/finality/markers';
import type { Reason, Stage } from '$lib/state/finality/v1';
import { formatNumber } from '$lib/utils/intl';

const BASELINE_FULL_MINUTES = 24 * 60;

export function stageLabel(stage: Stage): string {
	const labels: Record<Stage, string> = {
		production: 'Production',
		latency: 'Latency',
		votes: 'Votes',
		qc: 'QC',
		final: 'Final',
		feed: 'Feed'
	};
	return labels[stage] ?? stage;
}

export function reasonLabel(reason: Reason | string): string {
	const labels: Record<Reason, string> = {
		missed_slot: 'Missed slot',
		fork: 'Fork',
		latency: 'Latency above baseline p99',
		weak_qc: 'Weak QC',
		no_qc: 'No QC',
		qc_lag: 'QC lag over 1 block',
		votes_at_threshold: 'QC at threshold',
		time_to_final: 'Time to final above baseline p99',
		feed_paused: 'Feed paused',
		no_timing: 'No timing, backfilled'
	};
	return labels[reason as Reason] ?? reason;
}

export function statusLabel(status: StageStatus): string {
	const labels: Record<StageStatus, string> = {
		normal: 'Normal',
		departure: 'Departure',
		above_baseline: 'Above baseline',
		building: 'Building baseline',
		no_data: 'No data'
	};
	return labels[status];
}

export function formatMs(ms: number, locale: string): string {
	const rounded = Math.round(ms);
	if (Math.abs(rounded) < 1000) {
		const value = formatNumber(rounded, locale);
		// @wc-include
		return `${value} ms`;
	}
	const value = formatNumber(ms / 1000, locale, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	// @wc-include
	return `${value} s`;
}

export function formatSignedMs(ms: number, locale: string): string {
	const magnitude = formatMs(Math.abs(ms), locale);
	if (ms > 0) return `+${magnitude}`;
	if (ms < 0) return `−${magnitude}`;
	return magnitude;
}

export function coverageLabel(minutes: number, locale: string): string {
	if (minutes < BASELINE_COVERAGE_MINUTES) {
		const count = formatNumber(minutes, locale);
		// @wc-include
		return `Building, ${count} min of 24 h`;
	}
	if (minutes < BASELINE_FULL_MINUTES) {
		const hours = formatNumber(Math.floor(minutes / 60), locale);
		// @wc-include
		return `Baseline ${hours} h`;
	}
	return 'Baseline 24 h';
}
