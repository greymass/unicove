import { AppWindow } from '@lucide/svelte';
import { goto } from '$app/navigation';

import type { SearchActionPlugin } from '../types';

/**
 * Configuration for a page navigation action
 */
interface PageActionConfig {
	name: string;
	keywords: string[];
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
		description: config.description,
		execute: (context) => goto(context.urlPath(`/${context.network}${config.path}`)),
		ui: { icon: AppWindow }
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
		description: 'RAM Market Overview',
		path: '/ram'
	}),
	createPageAction({
		name: 'buy-ram',
		keywords: ['ram', 'buy'],
		description: 'Purchase RAM',
		path: '/ram/buy'
	}),
	createPageAction({
		name: 'sell-ram',
		keywords: ['ram', 'sell'],
		description: 'Sell RAM',
		path: '/ram/sell'
	}),
	createPageAction({
		name: 'send',
		keywords: ['send', 'transfer'],
		description: 'Transfer tokens',
		path: '/send'
	}),
	createPageAction({
		name: 'settings',
		keywords: ['settings', 'preferences'],
		description: 'Configure Unicove',
		path: '/settings'
	}),
	createPageAction({
		name: 'staking',
		keywords: ['staking', 'stake'],
		description: 'Staking overview',
		path: '/staking'
	}),
	createPageAction({
		name: 'stake',
		keywords: ['stake'],
		description: 'Stake Tokens',
		path: '/staking/stake'
	}),
	createPageAction({
		name: 'unstake',
		keywords: ['unstake'],
		description: 'Unstake tokens',
		path: '/staking/unstake'
	}),
	createPageAction({
		name: 'resources',
		keywords: ['resources', 'cpu', 'net', 'powerup'],
		description: 'Manage CPU/NET',
		path: '/resources'
	})
];
