import type { AccountResource } from '$lib/types';

export const calAvailableSize = (resource?: AccountResource) => {
	let size = 0;
	const available = Number(resource?.available);
	if (!isNaN(available)) size = available / 1000;
	return size;
};
