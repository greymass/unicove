import { createI18n } from '@inlang/paraglide-sveltekit';
import * as runtime from './paraglide/runtime';
import type { Asset } from '@wharfkit/antelope';

export const i18n = createI18n(runtime, {
	prefixDefaultLanguage: 'always',
	exclude: [/^\/[a-z0-9]+\/api\/.*/]
});

export function formatCurrency(amount: Asset) {
	return `$${Number(amount.value).toLocaleString()} USD`;
}
