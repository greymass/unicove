import { describe, expect, test } from 'bun:test';
import { vpRouteTabs } from './routes';
import type { VpSummary } from './types';

function summary(overrides: Partial<VpSummary> = {}): VpSummary {
	return {
		vp: 'VP-9999',
		title: 'Demonstration',
		standard: 'VPS-1',
		status: 'Proposed',
		authors: ['Aaron Cox'],
		created: '2026-08-10',
		accounts: [],
		msigs: [],
		sentiment: [],
		requires: [],
		slug: 'vp-9999-demo',
		path: 'proposals/vp-9999-demo/proposal.md',
		updated: null,
		translations: [],
		...overrides
	} as VpSummary;
}

describe('vpRouteTabs', () => {
	test('a draft with nothing bound offers only the document', () => {
		const tabs = vpRouteTabs('/proposals/vp-9999', summary(), {
			sentimentEnabled: true,
			revisionCount: 0
		});
		expect(tabs.map((t) => t.kind)).toEqual(['proposal']);
		expect(tabs[0].href).toBe('/proposals/vp-9999');
	});

	test('revisions appear with their count', () => {
		const tabs = vpRouteTabs('/proposals/vp-9999', summary(), {
			sentimentEnabled: true,
			revisionCount: 3
		});
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'revisions']);
		expect(tabs[1].count).toBe(3);
		expect(tabs[1].href).toBe('/proposals/vp-9999/revisions');
	});

	test('multisigs and sentiment appear when the proposal is bound', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' },
					{ proposer: 'test.gm', proposal: 'hqmz3rvktdxa', status: 'executed' }
				],
				sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }]
			}),
			{ sentimentEnabled: true, revisionCount: 3 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'multisigs', 'sentiment', 'revisions']);
		expect(tabs.map((t) => t.count)).toEqual([undefined, 2, undefined, 3]);
	});

	test('sentiment is absent when the network build has it switched off', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({ sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }] }),
			{ sentimentEnabled: false, revisionCount: 0 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal']);
	});

	test('a multisig alone is enough to offer sentiment', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({ msigs: [{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' }] }),
			{ sentimentEnabled: true, revisionCount: 0 }
		);
		expect(tabs.map((t) => t.kind)).toEqual(['proposal', 'multisigs', 'sentiment']);
		expect(tabs[1].count).toBe(1);
	});
});

describe('vpRouteTabs multisig count', () => {
	test('counts steps rather than raw entries, so a superseded attempt does not inflate it', () => {
		const tabs = vpRouteTabs(
			'/proposals/vp-9999',
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'expired' },
					{
						proposer: 'test.gm',
						proposal: 'bbbbbbbbbbbb',
						status: 'executed',
						txid: 'a'.repeat(64),
						supersedes: { proposer: 'test.gm', proposal: 'aaaaaaaaaaaa' }
					},
					{ status: 'planned', title: 'Return the account' }
				]
			}),
			{ sentimentEnabled: true, revisionCount: 0 }
		);
		const multisigs = tabs.find((t) => t.kind === 'multisigs');
		expect(multisigs?.count).toBe(2);
	});
});
