<script lang="ts">
	interface Props {
		'data-vp-anchors'?: string;
		children?: import('svelte').Snippet;
	}

	const { 'data-vp-anchors': anchors, children }: Props = $props();
</script>

<tr class="border-outline border-b last:border-none" data-vp-anchors={anchors}>
	{@render children?.()}
</tr>
