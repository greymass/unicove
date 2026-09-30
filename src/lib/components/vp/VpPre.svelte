<script lang="ts">
	import { setContext } from 'svelte';

	interface Props {
		'data-vp-anchors'?: string;
		children?: import('svelte').Snippet;
	}

	const { 'data-vp-anchors': anchors, children }: Props = $props();

	setContext('vp-code-block', true);
</script>

<div data-vp-anchors={anchors}>
	{@render children?.()}
</div>
