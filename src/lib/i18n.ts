import type { Asset } from '@wharfkit/antelope';

export function formatCurrency(amount: Asset) {
	return `$${Number(amount.value).toLocaleString()} USD`;
}
