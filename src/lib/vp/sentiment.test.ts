import { describe, expect, test } from 'bun:test';
import { vpMsigSteps } from './onchain';
import { vpApplyOwnVote, vpProposalTopicRows, vpStepHasPoll } from './sentiment';
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

describe('vpProposalTopicRows', () => {
	test('one row per declared topic, all votable', () => {
		const rows = vpProposalTopicRows(
			summary({ sentiment: [{ contract: 'sentiment.gm', topic: 'sentiment' }] })
		);
		expect(rows).toEqual([
			{
				kind: 'proposal',
				contract: 'sentiment.gm',
				topic: 'sentiment',
				topicPath: '/sentiment/topics/sentiment',
				votable: true
			}
		]);
		expect(rows[0].topic).toBe('sentiment');
	});

	test('no topics gives no rows', () => {
		expect(vpProposalTopicRows(summary())).toEqual([]);
	});
});

describe('vpStepHasPoll', () => {
	test('a planned step has no poll, because there is no multisig to poll on', () => {
		const steps = vpMsigSteps(
			summary({ msigs: [{ status: 'planned', title: 'Create the account' }] })
		);
		expect(steps.map(vpStepHasPoll)).toEqual([false]);
	});

	test('a step proposed on-chain has a poll whatever its status', () => {
		const steps = vpMsigSteps(
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'hqmz3rvktdxa', status: 'executed' },
					{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' },
					{ proposer: 'test.gm', proposal: 'pfy4wnsbcjrt', status: 'expired' }
				]
			})
		);
		expect(steps.map(vpStepHasPoll)).toEqual([true, true, true]);
	});

	test('a planned step among proposed ones is the only one without a poll', () => {
		const steps = vpMsigSteps(
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'active' },
					{ status: 'planned', title: 'Hand over the keys' }
				]
			})
		);
		expect(steps.map(vpStepHasPoll)).toEqual([true, false]);
	});
});

describe('vpApplyOwnVote', () => {
	const base = { totalVotes: 3, totalSupportWeight: 300, totalOppositionWeight: 100 };

	test('casting a first support vote adds the weight and the count', () => {
		expect(vpApplyOwnVote(base, null, 1, 100)).toEqual({
			totalVotes: 4,
			supportPercentage: 80,
			oppositionPercentage: 20
		});
	});

	test('removing your own support drops the weight and the count', () => {
		expect(vpApplyOwnVote(base, 1, null, 100)).toEqual({
			totalVotes: 2,
			supportPercentage: (200 / 300) * 100,
			oppositionPercentage: (100 / 300) * 100
		});
	});

	test('switching sides moves the weight without changing the count', () => {
		expect(vpApplyOwnVote(base, 1, 0, 100)).toEqual({
			totalVotes: 3,
			supportPercentage: 50,
			oppositionPercentage: 50
		});
	});

	test('removing the only vote reads as no votes rather than a negative tally', () => {
		const only = { totalVotes: 1, totalSupportWeight: 100, totalOppositionWeight: 0 };
		expect(vpApplyOwnVote(only, 1, null, 100)).toEqual({
			totalVotes: 0,
			supportPercentage: 0,
			oppositionPercentage: 0
		});
	});

	test('stale statistics missing your earlier vote clamp instead of going negative', () => {
		const stale = { totalVotes: 0, totalSupportWeight: 0, totalOppositionWeight: 0 };
		expect(vpApplyOwnVote(stale, 1, null, 100)).toEqual({
			totalVotes: 0,
			supportPercentage: 0,
			oppositionPercentage: 0
		});
	});
});
