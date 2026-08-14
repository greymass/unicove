import { describe, expect, test } from 'bun:test';
import { vpActionModels } from './actions';
import type { VpSummary } from './types';

const base: VpSummary = {
	vp: 'VP-9999',
	title: 'Demo',
	standard: 'VPS-1',
	status: 'Proposed',
	authors: ['Aaron Cox (Greymass)'],
	created: '2026-08-10',
	accounts: [],
	msigs: [],
	sentiment: [],
	requires: [],
	slug: 'vp-9999-demo',
	path: 'proposals/vp-9999-demo/proposal.md',
	updated: null,
	translations: []
};

describe('vpActionModels', () => {
	test('a proposal with neither binding has no actions', () => {
		expect(vpActionModels(base)).toEqual([]);
	});

	test('each sentiment topic becomes a topic row, in order', () => {
		const models = vpActionModels({
			...base,
			sentiment: [
				{ contract: 'sentiment.gm', topic: 'vpdemotopic' },
				{ contract: 'sentiment.gm', topic: 'vpsecond' }
			]
		});
		expect(models).toEqual([
			{ kind: 'sentiment-topic', contract: 'sentiment.gm', topic: 'vpdemotopic' },
			{ kind: 'sentiment-topic', contract: 'sentiment.gm', topic: 'vpsecond' }
		]);
	});

	test('an active msig becomes one sentiment row carrying its msig path', () => {
		const models = vpActionModels({
			...base,
			msigs: [{ proposer: 'demoaccount1', proposal: 'vpdemo', status: 'active' }]
		});
		expect(models).toEqual([
			{
				kind: 'sentiment-msig',
				proposer: 'demoaccount1',
				proposal: 'vpdemo',
				msigPath: '/msig/demoaccount1/vpdemo'
			}
		]);
	});

	test('a finished msig produces no action at all', () => {
		const models = vpActionModels({
			...base,
			msigs: [
				{ proposer: 'demoaccount1', proposal: 'vpdone', status: 'executed' },
				{ proposer: 'demoaccount1', proposal: 'vpold', status: 'expired' },
				{ proposer: 'demoaccount1', proposal: 'vpgone', status: 'cancelled' }
			]
		});
		expect(models).toEqual([]);
	});

	test('finished msigs drop out from among active ones', () => {
		const models = vpActionModels({
			...base,
			msigs: [
				{ proposer: 'demoaccount1', proposal: 'vpone', status: 'active' },
				{ proposer: 'demoaccount1', proposal: 'vpdone', status: 'executed' },
				{ proposer: 'demoaccount1', proposal: 'vptwo', status: 'active' }
			]
		});
		expect(models.map((m) => ('proposal' in m ? m.proposal : m.topic))).toEqual(['vpone', 'vptwo']);
	});

	test('a proposal whose only records are finished has no actions', () => {
		const models = vpActionModels({
			...base,
			msigs: [{ proposer: 'demoaccount1', proposal: 'vpdone', status: 'executed' }]
		});
		expect(models).toEqual([]);
	});

	test('topics come before msigs and each active msig contributes one row', () => {
		const models = vpActionModels({
			...base,
			sentiment: [{ contract: 'sentiment.gm', topic: 'vpdemotopic' }],
			msigs: [
				{ proposer: 'demoaccount1', proposal: 'vpone', status: 'active' },
				{ proposer: 'demoaccount1', proposal: 'vptwo', status: 'active' }
			]
		});
		expect(models.map((m) => m.kind)).toEqual([
			'sentiment-topic',
			'sentiment-msig',
			'sentiment-msig'
		]);
		expect(models.map((m) => ('proposal' in m ? m.proposal : m.topic))).toEqual([
			'vpdemotopic',
			'vpone',
			'vptwo'
		]);
	});
});
