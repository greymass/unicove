<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		for: string;
		children: Snippet;
	}

	import { createLabel, melt } from '@melt-ui/svelte';
	import { cn } from '$lib/utils/style';

	const {
		elements: { root }
	} = createLabel();

	let props: Props = $props();
</script>

<label for={props.for} use:melt={$root} class={cn('h5 semi-bold leading-tight', props.class)}>
	{@render props.children()}
</label>
