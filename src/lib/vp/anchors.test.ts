import { describe, expect, test } from 'bun:test';
import type { HastNode } from 'svelte-exmarkdown';
import { gfmPlugin } from 'svelte-exmarkdown/gfm';
import { createParser } from 'svelte-exmarkdown/utils';
import { bodyAnchors, lineAnchors, parseVpAnchor, rehypeVpLineAnchors } from './anchors';
import { rehypeVpHeadingIds } from './headings';

describe('lineAnchors', () => {
	test('hashes each trimmed line with whitespace collapsed', async () => {
		const raw = '## Part D — Limits\n\n  The budget   is 100 VAULTA.  \n| a | b |';
		expect(await lineAnchors(raw)).toEqual(['b-f3432b99', null, 'b-1093738f', 'b-881857d7']);
	});

	test('numbers repeats of a line from its second occurrence', async () => {
		const raw = 'The budget is 100 VAULTA.\nThe budget is 100 VAULTA.\n\nThe budget is 100 VAULTA.';
		expect(await lineAnchors(raw)).toEqual(['b-1093738f', 'b-1093738f-2', null, 'b-1093738f-3']);
	});
});

const NAV = '[English](proposal.md) | [한국어](proposal.ko.md)';
const english = [
	'---',
	'vp: VP-0001',
	'---',
	'# Title',
	'',
	NAV,
	'',
	'Intro line.',
	'',
	'## Alpha',
	'',
	'First para.',
	'',
	'## Beta',
	'',
	'Second para.'
].join('\n');

const korean = (paragraphs: string[]) =>
	[
		'---',
		'lang: ko',
		'source: 0000000000000000000000000000000000000000',
		'translator: agent',
		'---',
		'# 제목',
		'',
		NAV,
		'',
		'소개.',
		'',
		'## 알파',
		'',
		...paragraphs,
		'## 베타',
		'',
		'둘째 문단.'
	].join('\n');

const INTRO = 'b-65708da2';
const ALPHA = 'b-bdca47eb';
const FIRST = 'b-9ad42b72';
const BETA = 'b-e50ab301';
const SECOND = 'b-dcb07671';

describe('bodyAnchors', () => {
	test('keys an English file by its rendered body lines', async () => {
		expect(await bodyAnchors(english)).toEqual({
			mode: 'exact',
			lines: { 2: [INTRO], 4: [ALPHA], 6: [FIRST], 8: [BETA], 10: [SECOND] }
		});
	});

	test('gives an aligned current translation the English token of the same body line', async () => {
		const shown = korean(['첫 문단.', '']);
		expect(await bodyAnchors(shown, { raw: english, current: true })).toEqual({
			mode: 'exact',
			lines: { 2: [INTRO], 4: [ALPHA], 6: [FIRST], 8: [BETA], 10: [SECOND] }
		});
	});

	test('falls back to sections when a translation has drifted from the English lines', async () => {
		const shown = korean(['첫 문단.', '', '추가.', '']);
		expect(await bodyAnchors(shown, { raw: english, current: true })).toEqual({
			mode: 'section',
			lines: { 2: [INTRO], 4: [ALPHA, FIRST], 10: [BETA, SECOND] }
		});
	});

	test('falls back to sections when a translation is outdated', async () => {
		const shown = korean(['첫 문단.', '']);
		expect(await bodyAnchors(shown, { raw: english, current: false })).toEqual({
			mode: 'section',
			lines: { 2: [INTRO], 4: [ALPHA, FIRST], 8: [BETA, SECOND] }
		});
	});
});

function anchored(node: HastNode, out: [string, unknown][] = []): [string, unknown][] {
	if (node.type === 'element' && node.properties?.['data-vp-anchors']) {
		out.push([node.tagName, node.properties['data-vp-anchors']]);
	}
	node.children?.forEach((child) => anchored(child as HastNode, out));
	return out;
}

describe('rehypeVpLineAnchors', () => {
	test('tags the innermost block covering each anchored line', () => {
		const md = [
			'Intro line.',
			'',
			'- item one',
			'- item two',
			'  continued',
			'',
			'> quoted',
			'',
			'| a | b |',
			'|---|---|',
			'| 1 | 2 |',
			'',
			'```js',
			'code',
			'```'
		].join('\n');
		const lines: Record<number, string[]> = {};
		for (const n of [1, 3, 4, 5, 7, 9, 10, 11, 13, 14, 15]) lines[n] = [`b-l${n}`];
		const parse = createParser([gfmPlugin(), { rehypePlugin: rehypeVpLineAnchors(lines) }]);
		expect(anchored(parse(md) as HastNode)).toEqual([
			['p', 'b-l1'],
			['li', 'b-l3'],
			['li', 'b-l4 b-l5'],
			['p', 'b-l7'],
			['tr', 'b-l9'],
			['tr', 'b-l11'],
			['pre', 'b-l13 b-l14 b-l15']
		]);
	});

	test('keeps a heading id beside its anchors', () => {
		const parse = createParser([
			gfmPlugin(),
			{ rehypePlugin: rehypeVpHeadingIds },
			{ rehypePlugin: rehypeVpLineAnchors({ 1: ['b-h'] }) }
		]);
		const [heading] = (parse('## Part D — Limits') as unknown as { children: HastNode[] }).children;
		expect(heading).toMatchObject({
			tagName: 'h2',
			properties: { id: 'part-d-limits', 'data-vp-anchors': 'b-h' }
		});
	});
});

describe('parseVpAnchor', () => {
	test('reads a single line with its section', () => {
		expect(parseVpAnchor('#b-1093738f.f3432b99')).toEqual({
			first: 'b-1093738f',
			last: 'b-1093738f',
			section: 'b-f3432b99'
		});
	});

	test('reads a range and repeat suffixes', () => {
		expect(parseVpAnchor('#b-1093738f-2~881857d7.f3432b99-3')).toEqual({
			first: 'b-1093738f-2',
			last: 'b-881857d7',
			section: 'b-f3432b99-3'
		});
	});

	test('reads a line without a section', () => {
		expect(parseVpAnchor('#b-1093738f')).toEqual({
			first: 'b-1093738f',
			last: 'b-1093738f',
			section: null
		});
	});

	test('rejects anything else', () => {
		for (const hash of ['', '#part-d-limits', '#L42', '#b-XYZ', '#b-1093738f.', '#b-1093738f~']) {
			expect(parseVpAnchor(hash)).toBeNull();
		}
	});
});
