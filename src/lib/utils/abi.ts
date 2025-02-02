// Remove suffix syntax (e.g. [], ?, !, $)
export function parseRootType(type: string) {
	return type.replace(/\[|\]|\?|!|\$/g, '');
}
