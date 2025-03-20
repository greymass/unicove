<script lang="ts">
	import { cn } from '$lib/utils/style';
	import { XIcon } from 'lucide-svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onclick: () => any;
		class?: string;
	}
	let { onclick, ...props }: Props = $props();
</script>

<button
	class={cn(
		' text-muted grid size-12 place-items-center self-end rounded-lg focus-visible:outline-none focus-visible:ring focus-visible:ring-inset focus-visible:ring-solar-500 [@media(any-hover:hover)]:hover:text-white',
		props.class
	)}
	{onclick}
>
	<XIcon />
</button>
