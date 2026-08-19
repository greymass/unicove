const UNITS = ['bytes', 'KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes: number): string {
	let value = bytes;
	let unit = 0;
	while (value >= 1000 && unit < UNITS.length - 1) {
		value /= 1000;
		unit++;
	}
	const digits = unit === 0 ? 0 : value >= 100 ? 1 : 2;
	return `${value.toFixed(digits)} ${UNITS[unit]}`;
}
