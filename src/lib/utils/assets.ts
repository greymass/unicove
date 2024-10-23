import type { Asset } from '@wharfkit/antelope';

export function formatAsset(asset: Asset, decimals = 0) {
	const formattedValue = asset.value.toLocaleString('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	});
	return `${formattedValue} ${asset.symbol.code}`;
}
