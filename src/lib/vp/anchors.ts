import { prepareVpDocument } from './document';
import type { HastNode } from 'svelte-exmarkdown';

export type VpAnchorLine = string | null;

export type VpBodyAnchors = {
	mode: 'exact' | 'section';
	lines: Record<number, string[]>;
};

export function normalizeAnchorLine(line: string): string {
	return line.trim().replace(/\s+/g, ' ');
}

async function shortHash(text: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return Array.from(new Uint8Array(digest).slice(0, 4), (b) =>
		b.toString(16).padStart(2, '0')
	).join('');
}

/** The anchor token of every line of a file, null for blank lines. */
export async function lineAnchors(raw: string): Promise<VpAnchorLine[]> {
	const hashes = await Promise.all(
		raw.split('\n').map((line) => {
			const text = normalizeAnchorLine(line);
			return text ? shortHash(text) : null;
		})
	);
	const seen = new Map<string, number>();
	return hashes.map((hash) => {
		if (!hash) return null;
		const count = (seen.get(hash) ?? 0) + 1;
		seen.set(hash, count);
		return count === 1 ? `b-${hash}` : `b-${hash}-${count}`;
	});
}

// prepareVpDocument only drops leading lines, so the body is the file's tail.
async function bodyTokens(raw: string): Promise<{ body: string[]; tokens: VpAnchorLine[] }> {
	const body = prepareVpDocument(raw).body.split('\n');
	const all = await lineAnchors(raw);
	return { body, tokens: all.slice(all.length - body.length) };
}

function sameShape(a: string[], b: string[]): boolean {
	return a.length === b.length && a.every((line, i) => !line.trim() === !b[i].trim());
}

const SECTION = /^##\s/;

function sectionOf(body: string[]): number[] {
	let section = 0;
	return body.map((line) => (SECTION.test(line) ? ++section : section));
}

/** English anchor tokens keyed by 1-based line of the rendered body. */
export async function bodyAnchors(
	shownRaw: string,
	english?: { raw: string; current: boolean }
): Promise<VpBodyAnchors> {
	const shown = await bodyTokens(shownRaw);
	const source = english ? await bodyTokens(english.raw) : shown;
	const lines: Record<number, string[]> = {};
	const add = (line: number, token: string) => (lines[line] ??= []).push(token);

	if (!english || (english.current && sameShape(shown.body, source.body))) {
		source.tokens.forEach((token, i) => token && add(i + 1, token));
		return { mode: 'exact', lines };
	}

	const targets = new Map<number, number>();
	const shownSections = sectionOf(shown.body);
	shown.body.forEach((line, i) => {
		if (line.trim() && !targets.has(shownSections[i])) targets.set(shownSections[i], i + 1);
	});
	const sourceSections = sectionOf(source.body);
	source.tokens.forEach((token, i) => {
		const target = targets.get(sourceSections[i]);
		if (token && target) add(target, token);
	});
	return { mode: 'section', lines };
}

const BLOCKS = new Set(['p', 'li', 'tr', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

type Positioned = HastNode & { position?: { start: { line: number }; end: { line: number } } };

/** Writes each line's anchor tokens onto the innermost block whose source spans it. */
export function rehypeVpLineAnchors(lines: Record<number, string[]>) {
	return () => (tree: HastNode) => {
		const owners = new Map<number, HastNode>();
		const walk = (node: Positioned) => {
			if (node.type === 'element' && BLOCKS.has(node.tagName) && node.position) {
				for (let line = node.position.start.line; line <= node.position.end.line; line++) {
					owners.set(line, node);
				}
			}
			node.children?.forEach((child) => walk(child as Positioned));
		};
		walk(tree);

		const tokens = new Map<HastNode, string[]>();
		for (const [line, owner] of owners) {
			const found = lines[line];
			if (found) tokens.set(owner, [...(tokens.get(owner) ?? []), ...found]);
		}
		for (const [node, list] of tokens) {
			if (node.type === 'element') {
				node.properties = { ...node.properties, 'data-vp-anchors': list.join(' ') };
			}
		}
		return tree;
	};
}

export type VpAnchorTarget = { first: string; last: string; section: string | null };

const TOKEN = '[0-9a-f]{8}(?:-\\d+)?';
const FRAGMENT = new RegExp(`^#b-(${TOKEN})(?:~(${TOKEN}))?(?:\\.(${TOKEN}))?$`);

export function parseVpAnchor(hash: string): VpAnchorTarget | null {
	const match = FRAGMENT.exec(hash);
	if (!match) return null;
	return {
		first: `b-${match[1]}`,
		last: `b-${match[2] ?? match[1]}`,
		section: match[3] ? `b-${match[3]}` : null
	};
}

/** Anchors for a rendered page; a translation whose English source is unavailable carries none. */
export async function vpPageAnchors(
	raw: string,
	lang: string,
	englishRaw: string | null,
	current: boolean
): Promise<VpBodyAnchors> {
	if (lang === 'en') return bodyAnchors(raw);
	if (englishRaw === null) return { mode: 'section', lines: {} };
	return bodyAnchors(raw, { raw: englishRaw, current });
}
