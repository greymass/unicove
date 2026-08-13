import { describe, expect, test } from 'bun:test';
import { msigCardModels, partitionMsigCardModels, sentimentTopicPath, vpForMsig } from './onchain';
import type { VpSummary } from './types';

const base: VpSummary = {
	vp: 'VP-9999',
	title: 'Demo',
	standard: 'VPS-1',
	status: 'Proposed',
	authors: ['Aaron Cox (Greymass)'],
	created: '2026-08-10',
	accounts: [],
	msigs: [
		{ proposer: 'demoaccount1', proposal: 'vpdemo', status: 'active' },
		{ proposer: 'demoaccount1', proposal: 'vpdone', status: 'executed', txid: 'ab'.repeat(32) },
		{ proposer: 'demoaccount1', proposal: 'vpold', status: 'expired' }
	],
	sentiment: [{ contract: 'sentiment.gm', topic: 'vpdemotopic' }],
	requires: [],
	slug: 'vp-9999-demo',
	path: 'proposals/vp-9999-demo/proposal.md',
	updated: null,
	translations: []
};

describe('msigCardModels', () => {
	test('maps each binding to a card model in order', () => {
		const models = msigCardModels(base);
		expect(models).toHaveLength(3);
		expect(models[0]).toEqual({
			proposer: 'demoaccount1',
			proposal: 'vpdemo',
			status: 'active',
			msigPath: '/msig/demoaccount1/vpdemo',
			txPath: null,
			live: true
		});
	});
	test('executed bindings link their transaction and are not live', () => {
		const executed = msigCardModels(base)[1];
		expect(executed.txPath).toBe(`/transaction/${'ab'.repeat(32)}`);
		expect(executed.live).toBe(false);
	});
	test('concluded bindings without txid get no transaction link', () => {
		const expired = msigCardModels(base)[2];
		expect(expired.txPath).toBeNull();
		expect(expired.live).toBe(false);
	});
});

describe('partitionMsigCardModels', () => {
	test('splits live from finished, preserving order within each side', () => {
		const { live, finished } = partitionMsigCardModels(msigCardModels(base));
		expect(live.map((m) => m.proposal)).toEqual(['vpdemo']);
		expect(finished.map((m) => m.proposal)).toEqual(['vpdone', 'vpold']);
	});

	test('a proposal with no msigs yields two empty lists', () => {
		const { live, finished } = partitionMsigCardModels(msigCardModels({ ...base, msigs: [] }));
		expect(live).toEqual([]);
		expect(finished).toEqual([]);
	});

	test('cancelled msigs are finished', () => {
		const models = msigCardModels({
			...base,
			msigs: [{ proposer: 'demoaccount1', proposal: 'vpgone', status: 'cancelled' }]
		});
		const { live, finished } = partitionMsigCardModels(models);
		expect(live).toEqual([]);
		expect(finished.map((m) => m.proposal)).toEqual(['vpgone']);
	});
});

describe('vpForMsig', () => {
	const index = {
		generated: '2026-08-13T00:00:00Z',
		proposals: [{ ...base, vp: 'VP-0001', slug: 'vp-0001-first', msigs: [] }, base],
		skipped: 0
	};

	test('finds the proposal whose msigs contain the pair', () => {
		const found = vpForMsig(index, 'demoaccount1', 'vpdemo');
		expect(found?.vp).toBe('VP-9999');
	});

	test('returns null when no proposal claims the msig', () => {
		expect(vpForMsig(index, 'demoaccount1', 'nosuchmsig')).toBeNull();
	});

	test('returns null when the proposer does not match', () => {
		expect(vpForMsig(index, 'otheraccount', 'vpdemo')).toBeNull();
	});

	test('returns null for an index with no proposals', () => {
		expect(vpForMsig({ generated: '', proposals: [], skipped: 0 }, 'a', 'b')).toBeNull();
	});
});

describe('sentimentTopicPath', () => {
	test('routes to the topic page by topic name', () => {
		expect(sentimentTopicPath({ contract: 'sentiment.gm', topic: 'vpdemotopic' })).toBe(
			'/sentiment/topics/vpdemotopic'
		);
	});
});
