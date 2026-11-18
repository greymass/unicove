import { describe, expect, test } from 'bun:test';
import { parseVpIndex, type VpIndex, type VpStatus, type VpSummary } from './types';
import { vpRelation, vpSiblings } from './siblings';
import fixture from './fixtures/index.json';

const base = parseVpIndex(fixture);
const template = base.proposals[0];

function proposal(n: number, fields: Partial<VpSummary> = {}): VpSummary {
	const vp = `VP-${String(n).padStart(4, '0')}`;
	return { ...template, vp, title: `Proposal ${n}`, translations: [], requires: [], ...fields };
}

function indexOf(proposals: VpSummary[]): VpIndex {
	return { generated: base.generated, proposals, skipped: 0 };
}

describe('vpRelation', () => {
	test('requires and its reverse', () => {
		const a = proposal(1);
		const b = proposal(4, { requires: ['VP-0001'] });
		expect(vpRelation(b, a)).toBe('requires');
		expect(vpRelation(a, b)).toBe('required-by');
	});
	test('replacement from either side of the pair', () => {
		const old = proposal(1, { status: 'Superseded', 'superseded-by': ['VP-0002'] });
		const next = proposal(2, { replaces: ['VP-0001'] });
		expect(vpRelation(old, next)).toBe('superseded-by');
		expect(vpRelation(next, old)).toBe('replaces');
		expect(vpRelation(proposal(1), next)).toBe('superseded-by');
	});
	test('unrelated proposals', () => {
		expect(vpRelation(proposal(1), proposal(2))).toBeUndefined();
	});
});

describe('vpSiblings', () => {
	test('lists every proposal in index order with the current one marked', () => {
		const result = vpSiblings(base, base.proposals[1], 'en');
		expect(result.truncated).toBe(false);
		expect(result.entries.map((e) => e.vp)).toEqual(['VP-0001', 'VP-0002', 'VP-0003']);
		expect(result.entries.map((e) => e.current)).toEqual([false, true, false]);
	});
	test('uses the localized title', () => {
		const result = vpSiblings(base, base.proposals[1], 'ko');
		expect(result.entries[0].title).toBe('계정 온보딩을 위한 네트워크 RAM 기금');
	});
	test('past the limit keeps current, related, then live proposals in index order', () => {
		const statuses: VpStatus[] = ['Draft', 'Draft', 'Review', 'Draft', 'Proposed', 'Draft'];
		const proposals = statuses.map((status, i) => proposal(i + 1, { status }));
		proposals[5] = proposal(6, { requires: ['VP-0002'] });
		const result = vpSiblings(indexOf(proposals), proposals[5], 'en', 4);
		expect(result.truncated).toBe(true);
		expect(result.entries.map((e) => e.vp)).toEqual(['VP-0002', 'VP-0003', 'VP-0005', 'VP-0006']);
		expect(result.entries[0].relation).toBe('requires');
	});
});
