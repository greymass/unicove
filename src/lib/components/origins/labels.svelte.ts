import type { StatWindow } from '$lib/state/statindex/utils';
import type { OriginKind } from '$lib/state/creationindex/origins';

export function kindLabel(kind: OriginKind): string {
	const labels: Record<OriginKind, string> = {
		buy: 'Bought',
		transfer: 'Transferred',
		gift: 'Gifted',
		program_gift: 'Network-funded',
		quota_set: 'Set by the system',
		none: 'No RAM'
	};
	return labels[kind];
}

export function kindSentence(kind: OriginKind): string {
	const sentences: Record<OriginKind, string> = {
		buy: 'The creator bought RAM for the new account.',
		transfer:
			"The creator moved some of its own RAM to the new account; the creator can't take it back.",
		gift: 'The creator gifted RAM it can take back once the account returns it.',
		program_gift: 'The network-funded onboarding program paid for the RAM.',
		quota_set: 'A privileged action set the RAM quota directly.',
		none: 'The account arrived with no RAM of its own.'
	};
	return sentences[kind];
}

export function windowLabel(window: StatWindow): string {
	const labels: Record<StatWindow, string> = {
		'30d': 'Last 30 days',
		'90d': 'Last 90 days',
		'365d': 'Last year',
		all: 'Since launch'
	};
	return labels[window];
}
