// Remove suffix syntax (e.g. [], ?, !, $)
export function parseRootType(type: string) {
	return type.replace(/\[|\]|\?|!|\$/g, '');
}

interface StructLike<F> {
	name: string;
	base: string;
	fields: F[];
}

export function structFields<F>(
	structs: StructLike<F>[],
	name: string,
	seen = new Set<string>()
): F[] {
	const struct = structs.find((s) => s.name === name);
	if (!struct || seen.has(name)) return [];
	seen.add(name);
	const inherited = struct.base ? structFields(structs, struct.base, seen) : [];
	return [...inherited, ...struct.fields];
}
