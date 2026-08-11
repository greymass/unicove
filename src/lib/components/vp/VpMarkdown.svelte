<script lang="ts">
	import { setContext } from 'svelte';
	import Markdown from 'svelte-exmarkdown';
	import { gfmPlugin } from 'svelte-exmarkdown/gfm';
	import type { Plugin } from 'svelte-exmarkdown';
	import { TD, TH, TR } from 'unicove-components';
	import { rehypeVpHeadingIds } from '$lib/vp/headings';
	import VpLink from './VpLink.svelte';
	import VpImage from './VpImage.svelte';
	import VpHeading2 from './VpHeading2.svelte';
	import VpHeading3 from './VpHeading3.svelte';
	import VpHeading4 from './VpHeading4.svelte';
	import VpHeading5 from './VpHeading5.svelte';
	import VpHeading6 from './VpHeading6.svelte';
	import VpTable from './VpTable.svelte';
	import VpPre from './VpPre.svelte';
	import VpCode from './VpCode.svelte';

	interface Props {
		body: string;
		slug: string;
		basePath: string;
	}

	const { body, slug, basePath }: Props = $props();

	// Getters keep the context tracking the props across client-side navigation between proposals.
	setContext('vp-links', {
		get slug() {
			return slug;
		},
		get basePath() {
			return basePath;
		}
	});

	const vpPlugin: Plugin = {
		rehypePlugin: rehypeVpHeadingIds,
		renderer: {
			a: VpLink,
			img: VpImage,
			table: VpTable,
			tr: TR,
			td: TD,
			th: TH,
			pre: VpPre,
			code: VpCode,
			h2: VpHeading2,
			h3: VpHeading3,
			h4: VpHeading4,
			h5: VpHeading5,
			h6: VpHeading6
		}
	};

	const plugins = [gfmPlugin(), vpPlugin];
</script>

<div class="vp-prose">
	<Markdown md={body} {plugins} />
</div>

<style>
	.vp-prose {
		line-height: 1.7;
	}
	.vp-prose :global(p) {
		margin-block: 0.75rem;
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
</style>
