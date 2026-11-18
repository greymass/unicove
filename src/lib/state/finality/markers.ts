import type {
	BaselineFinalizer,
	BaselineGridCell,
	BaselineMessage,
	BlockMessage,
	SpanMessage
} from './v1';

export const BASELINE_COVERAGE_MINUTES = 60;
export const FINALIZER_COVERAGE_QCS = 7_200;
export const MARKER_QUANTILE = 0.99;
export const CHRONIC_SHARE = 0.05;

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

export function familyQuantile(tests: number): number {
	return 1 - (1 - MARKER_QUANTILE) / Math.max(1, tests);
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

export function finalizerChronic(entry: BaselineFinalizer | undefined): boolean {
	return finalizerCovered(entry) && finalizerRate(entry) >= CHRONIC_SHARE;
}

export function flaggedFirst<T>(rows: readonly T[], flagged: (row: T) => boolean): T[] {
	return [...rows.filter(flagged), ...rows.filter((row) => !flagged(row))];
}

export function finalizerRowMarked(
	missing: number,
	qcs: number,
	entry: BaselineFinalizer | undefined,
	rows = 1
): boolean {
	if (!finalizerCovered(entry)) return false;
	return missing > binomialQuantile(qcs, finalizerRate(entry), familyQuantile(rows));
}

export function gridCellMarked(
	cell: BaselineGridCell,
	entry: BaselineFinalizer | undefined,
	cells = 1
): boolean {
	if (!finalizerCovered(entry)) return false;
	return cell.missing > binomialQuantile(cell.qcs, finalizerRate(entry), familyQuantile(cells));
}

export function latencyMarkedProducers(
	blocks: readonly BlockMessage[],
	spans: Iterable<SpanMessage>,
	baseline: BaselineMessage | null
): Set<string> {
	const marked = new Set<string>();
	if (!baselineCovered(baseline) || baseline.latency_p99 === null) return marked;
	const p99 = baseline.latency_p99;
	const runs = [...spans].filter((span) => span.stage === 'latency');
	if (!runs.length) return marked;
	for (const block of blocks) {
		if (block.no_timing || block.latency <= p99) continue;
		if (runs.some((span) => block.block_num >= span.from && block.block_num <= span.to)) {
			marked.add(block.producer);
		}
	}
	return marked;
}
