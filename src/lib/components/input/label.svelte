<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		for: string;
		children: Snippet;
	}

	import { createLabel, melt } from '@melt-ui/svelte';

	const {
		elements: { root }
	} = createLabel();

	let props: Props = $props();
</script>

<label for={props.for} use:melt={$root} class="h5 semi-bold">
	{@render props.children()}
</label>
