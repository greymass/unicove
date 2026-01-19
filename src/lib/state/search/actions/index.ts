import type { SearchActionPlugin } from '../types';
import { ClearAction } from './clear';
import { PageActions } from './pages';

// Export individual actions
export { ClearAction } from './clear';
export { PageActions } from './pages';

/**
 * Default action plugins registered in the search system.
 * Sorted by priority (lower = higher priority).
 */
export const defaultActionPlugins: SearchActionPlugin[] = [
	...PageActions, // priority: 50
	ClearAction // priority: 1000
];
