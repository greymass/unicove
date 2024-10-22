import type { Asset } from '@wharfkit/antelope';

export function formatAsset(asset: Asset) {
	const formattedValue = asset.value.toLocaleString('en-US', {
		minimumFractionDigits: asset.symbol.precision,
		maximumFractionDigits: asset.symbol.precision
	});
	return `${formattedValue} ${asset.symbol.code}`;
}
