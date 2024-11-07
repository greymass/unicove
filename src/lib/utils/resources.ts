import type { Resource } from '@wharfkit/account';

export const calAvailableSize = (resource?: Resource) => {
	let size = 0;
	const available = Number(resource?.available);
	if (!isNaN(available)) size = available / 1000;
	return size;
};
