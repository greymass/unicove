<!-- The Center aligns its content horizontally centered -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	const { class: className = '', children, ...props }: Props = $props();
</script>

<div class={`layout-center ${className}`} {...props}>
	{@render children()}
</div>
