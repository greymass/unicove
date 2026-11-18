import type { AdminAction, Approver, Blocker } from '$lib/state/creationindex/onboarding';
import { QUOTA_FLOOR } from '$lib/state/creationindex/onboarding';
import { formatNumber } from '$lib/utils/intl';

export function eventLabel(action: string): string {
	const labels: Record<string, string> = {
		giftram: 'Gift',
		ungiftram: 'Return',
		addcreator: 'Creator added',
		rmcreator: 'Creator removed',
		setquota: 'Quota changed',
		suspend: 'Creator suspended',
		resume: 'Creator resumed',
		enable: 'Gifting turned on',
		disable: 'Gifting turned off',
		buyram: 'RAM bought',
		buyrambytes: 'RAM bought',
		ramtransfer: 'RAM transferred'
	};
	return labels[action] ?? action;
}

export function actionPhrase(action: string): string {
	const phrases: Record<AdminAction, string> = {
		addcreator: 'Admit a creator',
		setquota: 'Change a quota',
		suspend: 'Suspend a creator',
		resume: 'Resume a creator',
		rmcreator: 'Remove a creator',
		enable: 'Turn gifting on',
		disable: 'Turn gifting off'
	};
	return phrases[action as AdminAction] ?? action;
}

export function approverText(approver: Approver, locale: string): string {
	if (approver.kind === 'key') {
		// @wc-include
		const key = `${approver.actor}'s key`;
		return key;
	}
	if (approver.kind === 'permission') return `${approver.actor}@${approver.permission}`;
	const threshold = formatNumber(approver.threshold, locale);
	const total = formatNumber(approver.total, locale);
	const texts = {
		// @wc-include
		producers: `${threshold} of ${total} producers`,
		// @wc-include
		accounts: `${threshold} of ${total} accounts`
	};
	return texts[approver.kind];
}

export function blockerText(blocker: Blocker, creator: string, locale: string): string {
	const texts: Record<Blocker, string> = {
		bad_name: 'Enter an account name.',
		// @wc-include
		no_account: `${creator} does not exist on this chain.`,
		quota_required: 'Enter a daily quota in bytes.',
		quota_floor: `A quota must be at least ${formatNumber(QUOTA_FLOOR, locale)} bytes.`,
		// @wc-include
		registered: `${creator} is already a creator.`,
		// @wc-include
		unregistered: `${creator} is not a registered creator.`,
		// @wc-include
		suspended: `${creator} is already suspended.`,
		// @wc-include
		not_suspended: `${creator} is not suspended.`,
		// @wc-include
		same_quota: `${creator} already has this quota.`
	};
	return texts[blocker];
}

export function statusLabel(status: 'gifting' | 'suspended' | 'off' | 'removed'): string {
	const labels = {
		gifting: 'Gifting',
		suspended: 'Suspended',
		off: 'Program disabled',
		removed: 'Removed'
	};
	return labels[status];
}

export function runwayText(days: number | null, locale: string): string {
	if (days === null || !Number.isFinite(days)) return 'No net outflow';
	// @wc-include
	if (days < 1) return `${formatNumber(Math.round(days * 24), locale)} hours`;
	// @wc-include
	if (days < 10) return `${formatNumber(days, locale, { maximumFractionDigits: 1 })} days`;
	// @wc-include
	if (days < 730) return `${formatNumber(Math.round(days), locale)} days`;
	// @wc-include
	return `${formatNumber(days / 365, locale, { maximumFractionDigits: 1 })} years`;
}

export function eventFilterLabel(
	filter: 'all' | 'program_gift' | 'return' | 'admin' | 'ram_movement'
): string {
	const labels = {
		all: 'All',
		program_gift: 'Gifts',
		return: 'Returns',
		admin: 'Admin',
		ram_movement: 'RAM movements'
	};
	return labels[filter];
}
