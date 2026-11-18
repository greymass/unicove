<script lang="ts">
	import { setContext } from 'svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { Plugin } from 'svelte-exmarkdown';
	import { TD, TH } from '@wharfkit/svelte-components';
	import { rehypeVpLineAnchors, type VpBodyAnchors } from '$lib/vp/anchors';
	import { rehypeVpHeadingIds } from '$lib/vp/headings';
	import { VP_BRANCH } from '$lib/vp/links';
	import VpLink from './VpLink.svelte';
	import VpImage from './VpImage.svelte';
	import VpHeading1 from './VpHeading1.svelte';
	import VpHeading2 from './VpHeading2.svelte';
	import VpHeading3 from './VpHeading3.svelte';
	import VpHeading4 from './VpHeading4.svelte';
	import VpHeading5 from './VpHeading5.svelte';
	import VpHeading6 from './VpHeading6.svelte';
	import VpTable from './VpTable.svelte';
	import VpPre from './VpPre.svelte';
	import VpCode from './VpCode.svelte';
	import VpTableRow from './VpTableRow.svelte';
	import VpAnchorFocus from './VpAnchorFocus.svelte';

	interface Props {
		body: string;
		slug: string;
		basePath: string;
		branch?: string;
		anchors?: VpBodyAnchors;
	}

	const { body, slug, basePath, branch = VP_BRANCH, anchors }: Props = $props();

	let container: HTMLElement | undefined = $state();

	// Getters keep the context tracking the props across client-side navigation between proposals.
	setContext('vp-links', {
		get slug() {
			return slug;
		},
		get basePath() {
			return basePath;
		},
		get branch() {
			return branch;
		}
	});

	const vpPlugin: Plugin = {
		rehypePlugin: rehypeVpHeadingIds,
		renderer: {
			a: VpLink,
			img: VpImage,
			table: VpTable,
			tr: VpTableRow,
			td: TD,
			th: TH,
			pre: VpPre,
			code: VpCode,
			h1: VpHeading1,
			h2: VpHeading2,
			h3: VpHeading3,
			h4: VpHeading4,
			h5: VpHeading5,
			h6: VpHeading6
		}
	};

	const plugins = $derived([
		gfmPlugin(),
		vpPlugin,
		{ rehypePlugin: rehypeVpLineAnchors(anchors?.lines ?? {}) }
	]);
</script>

<div class="vp-prose" bind:this={container}>
	<Markdown md={body} {plugins} />
</div>
{#if anchors}
	<VpAnchorFocus {container} mode={anchors.mode} />
{/if}

<style>
	.vp-prose {
		line-height: 1.7;
	}
	.vp-prose > :global(:first-child) {
		margin-block-start: 0;
	}
	.vp-prose :global(p) {
		margin-block: 0.75rem;
		color: var(--color-on-surface);
	}
	.vp-prose :global(a) {
		color: var(--color-primary);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklab, var(--color-primary) 50%, transparent);
		text-underline-offset: 0.2em;
		transition: text-decoration-color 120ms ease-out;
	}
	.vp-prose :global(a:hover) {
		text-decoration-color: var(--color-primary);
	}
	.vp-prose :global(blockquote p) {
		color: inherit;
	}
	.vp-prose :global(ul),
	.vp-prose :global(ol) {
		margin-block: 0.75rem;
		padding-inline-start: 1.5rem;
	}
	.vp-prose :global(ul) {
		list-style: disc;
	}
	.vp-prose :global(ol) {
		list-style: decimal;
	}
	.vp-prose :global(li) {
		margin-block: 0.375rem;
		color: var(--color-on-surface);
	}
	.vp-prose :global(table) {
		margin-block: 1rem;
	}
	.vp-prose :global(blockquote) {
		margin-block: 1rem;
		padding-inline-start: 1rem;
		border-inline-start: 3px solid var(--color-outline);
		color: var(--color-muted);
	}
	.vp-prose :global(hr) {
		margin-block: 2rem;
	}
	.vp-prose {
		--vp-cited: var(--color-solar-300, #ffe246);
		--vp-cited-peak: var(--color-solar-400, #ffd11b);
		--vp-cited-edge: var(--color-solar-700, #bb5d02);
	}
	:global([data-scheme='dark']) .vp-prose {
		--vp-cited: color-mix(in oklab, var(--color-solar-400, #ffd11b) 22%, transparent);
		--vp-cited-peak: color-mix(in oklab, var(--color-solar-400, #ffd11b) 55%, transparent);
		--vp-cited-edge: color-mix(in oklab, var(--color-solar-400, #ffd11b) 75%, transparent);
	}
	.vp-prose :global(.vp-cited) {
		scroll-margin-block: 6rem;
	}
	.vp-prose :global(.vp-cited:not(tr)) {
		--vp-join: 0.375rem;
		position: relative;
		isolation: isolate;
	}
	.vp-prose :global(li.vp-cited) {
		--vp-join: 0.1875rem;
	}
	.vp-prose :global(.vp-cited:not(tr)::before) {
		content: '';
		position: absolute;
		z-index: -1;
		inset: calc(-1 * var(--vp-join)) -0.5rem;
		background-color: var(--vp-cited);
		border: 1px solid var(--vp-cited-edge);
		border-block-width: 0;
		pointer-events: none;
		animation: vp-cited-arrive 1600ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.vp-prose :global(.vp-cited-first:not(tr)::before) {
		top: -0.25rem;
		border-block-start-width: 1px;
		border-start-start-radius: 0.375rem;
		border-start-end-radius: 0.375rem;
	}
	.vp-prose :global(.vp-cited-last:not(tr)::before) {
		bottom: -0.25rem;
		border-block-end-width: 1px;
		border-end-start-radius: 0.375rem;
		border-end-end-radius: 0.375rem;
	}
	.vp-prose :global(tr.vp-cited > *) {
		--vp-l: transparent;
		--vp-r: transparent;
		--vp-t: transparent;
		--vp-b: transparent;
		background-color: var(--vp-cited);
		box-shadow:
			inset 1px 0 0 var(--vp-l),
			inset -1px 0 0 var(--vp-r),
			inset 0 1px 0 var(--vp-t),
			inset 0 -1px 0 var(--vp-b);
		animation: vp-cited-arrive 1600ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.vp-prose :global(tr.vp-cited > :first-child) {
		--vp-l: var(--vp-cited-edge);
	}
	.vp-prose :global(tr.vp-cited > :last-child) {
		--vp-r: var(--vp-cited-edge);
	}
	.vp-prose :global(tr.vp-cited-first > *) {
		--vp-t: var(--vp-cited-edge);
	}
	.vp-prose :global(tr.vp-cited-last > *) {
		--vp-b: var(--vp-cited-edge);
	}
	@keyframes -global-vp-cited-arrive {
		from {
			background-color: var(--vp-cited-peak);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.vp-prose :global(.vp-cited:not(tr)::before),
		.vp-prose :global(tr.vp-cited > *) {
			animation: none;
		}
	}
	/* Long unbreakable tokens (hashes, account paths) must wrap instead of stretching the page. */
	.vp-prose :global(code) {
		overflow-wrap: anywhere;
	}
</style>
