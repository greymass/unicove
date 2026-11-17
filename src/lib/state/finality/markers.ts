import type { BaselineFinalizer, BaselineGridCell, BaselineMessage } from './v1';

export const BASELINE_COVERAGE_MINUTES = 60;
export const FINALIZER_COVERAGE_QCS = 7_200;
export const MARKER_QUANTILE = 0.99;

export function binomialQuantile(n: number, p: number, q: number): number {
	if (n <= 0 || p <= 0) return 0;
	if (p >= 1) return n;
	const target = Math.log(q);
	const step = Math.log(p) - Math.log1p(-p);
	let logPmf = n * Math.log1p(-p);
	let logCdf = logPmf;
	for (let k = 0; k < n; k++) {
		if (logCdf >= target) return k;
		logPmf += Math.log(n - k) - Math.log(k + 1) + step;
		logCdf = logAddExp(logCdf, logPmf);
	}
	return n;
}

function logAddExp(a: number, b: number): number {
	if (a === -Infinity) return b;
	if (b === -Infinity) return a;
	const high = Math.max(a, b);
	return high + Math.log1p(Math.exp(Math.min(a, b) - high));
}

export function baselineCovered(baseline: BaselineMessage | null): baseline is BaselineMessage {
	return !!baseline && baseline.minutes >= BASELINE_COVERAGE_MINUTES;
}

export function finalizerCovered(entry: BaselineFinalizer | undefined): entry is BaselineFinalizer {
	return !!entry && entry.qcs >= FINALIZER_COVERAGE_QCS;
}

export function finalizerRate(entry: BaselineFinalizer): number {
	return entry.qcs > 0 ? entry.missing / entry.qcs : 0;
}

export function finalizerRowMarked(
	missing: number,
	qcs: number,
	entry: BaselineFinalizer | undefined
): boolean {
	if (!finalizerCovered(entry)) return false;
	return missing > binomialQuantile(qcs, finalizerRate(entry), MARKER_QUANTILE);
}

export function gridCellMarked(
	cell: BaselineGridCell,
	entry: BaselineFinalizer | undefined
): boolean {
	if (!finalizerCovered(entry)) return false;
	return cell.missing > binomialQuantile(cell.qcs, finalizerRate(entry), MARKER_QUANTILE);
}

export function producerRowMarked(
	latencyP90: number | null,
	baseline: BaselineMessage | null
): boolean {
	if (latencyP90 === null || !baselineCovered(baseline) || baseline.latency_p99 === null) {
		return false;
	}
	return latencyP90 > baseline.latency_p99;
}
