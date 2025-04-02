<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}
	let props: Props = $props();
</script>

<section class="subgrid gap-8 @3xl:gap-12">
	{@render props.children()}
</section>
