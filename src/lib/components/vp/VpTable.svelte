<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();
</script>

<table class="overflow-x-auto">
	{@render children?.()}
</table>
