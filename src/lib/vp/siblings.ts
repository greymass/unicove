import { vpCardText } from './card';
import type { VpIndex, VpStatus, VpSummary } from './types';

export type VpRelation = 'superseded-by' | 'replaces' | 'requires' | 'required-by';

export interface VpSibling {
	vp: string;
	title: string;
	status: VpStatus;
	current: boolean;
	relation?: VpRelation;
}

export interface VpSiblings {
	entries: VpSibling[];
	truncated: boolean;
}

export const VP_SIBLING_LIMIT = 8;

const LIVE_STATUSES: VpStatus[] = ['Proposed', 'Review'];

export function vpRelation(current: VpSummary, other: VpSummary): VpRelation | undefined {
	if (current['superseded-by']?.includes(other.vp) || other.replaces?.includes(current.vp)) {
		return 'superseded-by';
	}
	if (current.replaces?.includes(other.vp) || other['superseded-by']?.includes(current.vp)) {
		return 'replaces';
	}
	if (current.requires.includes(other.vp)) return 'requires';
	if (other.requires.includes(current.vp)) return 'required-by';
	return undefined;
}

function rank(entry: VpSibling): number {
	if (entry.current) return 0;
	if (entry.relation) return 1;
	return LIVE_STATUSES.includes(entry.status) ? 2 : 3;
}

/** Every proposal in index order, or past `limit` the current, related, then live ones. */
export function vpSiblings(
	index: VpIndex,
	current: VpSummary,
	locale: string,
	limit: number = VP_SIBLING_LIMIT
): VpSiblings {
	const entries: VpSibling[] = index.proposals.map((p) => ({
		vp: p.vp,
		title: vpCardText(p, locale).title,
		status: p.status,
		current: p.vp === current.vp,
		relation: p.vp === current.vp ? undefined : vpRelation(current, p)
	}));
	if (entries.length <= limit) return { entries, truncated: false };
	const kept = new Set(
		entries
			.toSorted((a, b) => rank(a) - rank(b))
			.slice(0, limit)
			.map((e) => e.vp)
	);
	return { entries: entries.filter((e) => kept.has(e.vp)), truncated: true };
}
