import { describe, expect, test } from 'bun:test';
import { msigCardModels, sentimentTopicPath } from './onchain';
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

describe('sentimentTopicPath', () => {
	test('routes to the topic page by topic name', () => {
		expect(sentimentTopicPath({ contract: 'sentiment.gm', topic: 'vpdemotopic' })).toBe(
			'/sentiment/topics/vpdemotopic'
		);
	});
});
