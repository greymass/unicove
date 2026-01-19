import { File } from '@lucide/svelte';
import { goto } from '$app/navigation';

import type { SearchActionPlugin } from '../types';

/**
 * Configuration for a page navigation action
 */
interface PageActionConfig {
	name: string;
	keywords: string[];
	value: string;
	description: string;
	path: string;
}

/**
 * Factory function to create page navigation action plugins
 */
function createPageAction(config: PageActionConfig): SearchActionPlugin {
	return {
		name: config.name,
		priority: 50,
		enabled: (context) => !!context.settings.data.searchShowPages,
		keywords: config.keywords,
		value: config.value,
		description: config.description,
		execute: (context) => goto(context.urlPath(`/${context.network}${config.path}`)),
		ui: { icon: File }
	};
}

/**
 * Page Navigation Actions
 * Quick navigation to common pages in the application
 */
export const PageActions: SearchActionPlugin[] = [
	createPageAction({
		name: 'ram-market',
		keywords: ['ram'],
		value: 'RAM Market Overview',
		description: 'View Page',
		path: '/ram'
	}),
	createPageAction({
		name: 'buy-ram',
		keywords: ['ram', 'buy'],
		value: 'Purchase RAM',
		description: 'View Page',
		path: '/ram/buy'
	}),
	createPageAction({
		name: 'sell-ram',
		keywords: ['ram', 'sell'],
		value: 'Sell RAM',
		description: 'View Page',
		path: '/ram/sell'
	}),
	createPageAction({
		name: 'send',
		keywords: ['send', 'transfer'],
		value: 'Send tokens',
		description: 'View Page',
		path: '/send'
	}),
	createPageAction({
		name: 'settings',
		keywords: ['settings', 'preferences'],
		value: 'Unicove settings',
		description: 'View Page',
		path: '/settings'
	}),
	createPageAction({
		name: 'staking',
		keywords: ['staking', 'stake'],
		value: 'Staking overview',
		description: 'View Page',
		path: '/staking'
	}),
	createPageAction({
		name: 'stake',
		keywords: ['stake'],
		value: 'Stake Tokens',
		description: 'View Page',
		path: '/staking/stake'
	}),
	createPageAction({
		name: 'unstake',
		keywords: ['unstake'],
		value: 'Unstake tokens',
		description: 'View Page',
		path: '/staking/unstake'
	}),
	createPageAction({
		name: 'resources',
		keywords: ['resources', 'cpu', 'net', 'powerup'],
		value: 'Manage CPU/NET',
		description: 'View Page',
		path: '/resources'
	})
];
