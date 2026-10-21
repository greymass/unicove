<script lang="ts">
	import VpHeading from './VpHeading.svelte';

	interface Props {
		id?: string;
		'data-vp-anchors'?: string;
		children?: import('svelte').Snippet;
	}

	const { id, 'data-vp-anchors': anchors, children }: Props = $props();
</script>

<VpHeading level={4} {id} {anchors}>{@render children?.()}</VpHeading>
