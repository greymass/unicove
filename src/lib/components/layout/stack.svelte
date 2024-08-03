<!-- The Stack component inserts vertical margins -->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	const { class: className = '', ...props }: Props = $props();
</script>

<div class={`layout-stack ${className}`} {...props}>
	{@render props.children()}
</div>
