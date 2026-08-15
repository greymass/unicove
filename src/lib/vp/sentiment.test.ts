import { describe, expect, it, test } from 'bun:test';
import { vpMsigPollRows, vpProposalTopicRows, vpSentimentRowKey } from './sentiment';
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
		expect(vpSentimentRowKey(rows[0])).toBe('topic:sentiment');
	});

	test('no topics gives no rows', () => {
		expect(vpProposalTopicRows(summary())).toEqual([]);
	});
});

describe('vpMsigPollRows', () => {
	test('declared order is kept, and active multisigs are the only votable ones', () => {
		const rows = vpMsigPollRows(
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'hqmz3rvktdxa', status: 'executed' },
					{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' },
					{ proposer: 'test.gm', proposal: 'pfy4wnsbcjrt', status: 'expired' }
				]
			})
		);
		expect(rows.map((r) => r.proposal)).toEqual(['hqmz3rvktdxa', 'ugkuddhb2jwp', 'pfy4wnsbcjrt']);
		expect(rows.map((r) => r.votable)).toEqual([false, true, false]);
	});

	test('a row carries the paths its component needs', () => {
		const rows = vpMsigPollRows(
			summary({ msigs: [{ proposer: 'test.gm', proposal: 'ugkuddhb2jwp', status: 'active' }] })
		);
		expect(rows[0].msigPath).toBe('/msig/test.gm/ugkuddhb2jwp');
		expect(rows[0].status).toBe('active');
		expect(vpSentimentRowKey(rows[0])).toBe('msigvote:test.gm/ugkuddhb2jwp');
	});

	test('declaration order is kept within each group', () => {
		const rows = vpMsigPollRows(
			summary({
				msigs: [
					{ proposer: 'test.gm', proposal: 'aaa', status: 'active' },
					{ proposer: 'test.gm', proposal: 'bbb', status: 'active' },
					{ proposer: 'test.gm', proposal: 'ccc', status: 'cancelled' }
				]
			})
		);
		expect(rows.map((r) => r.proposal)).toEqual(['aaa', 'bbb', 'ccc']);
	});
});

describe('vpMsigPollRows step ordering', () => {
	const base = summary();

	it('keeps declared order instead of putting votable rows first', () => {
		const rows = vpMsigPollRows({
			...base,
			msigs: [
				{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'executed', txid: 'a'.repeat(64) },
				{ proposer: 'test.gm', proposal: 'bbbbbbbbbbbb', status: 'active' }
			]
		});
		expect(rows.map((r) => r.proposal)).toEqual(['aaaaaaaaaaaa', 'bbbbbbbbbbbb']);
		expect(rows.map((r) => r.step)).toEqual([1, 2]);
		expect(rows.map((r) => r.votable)).toEqual([false, true]);
	});

	it('omits a planned step, which has no poll', () => {
		const rows = vpMsigPollRows({
			...base,
			msigs: [
				{ status: 'planned', title: 'Create the account' },
				{ proposer: 'test.gm', proposal: 'bbbbbbbbbbbb', status: 'active' }
			]
		});
		expect(rows).toHaveLength(1);
		expect(rows[0].step).toBe(2);
	});

	it('carries the step title through', () => {
		const rows = vpMsigPollRows({
			...base,
			msigs: [
				{ proposer: 'test.gm', proposal: 'aaaaaaaaaaaa', status: 'active', title: 'Deploy it' }
			]
		});
		expect(rows[0].title).toBe('Deploy it');
	});
});
