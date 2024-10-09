/**
 * Truncates a long string with a two-dot ellipsis in the center
 * @example "1234567890" => "1234..7890"
 */
export const truncateCenter = (s: string, len: number = 12): string => {
	if (s.length <= len) return s;
	const l = Math.floor((len - 1) / 2);
	return s.slice(0, l) + '..' + s.slice(-l);
};
