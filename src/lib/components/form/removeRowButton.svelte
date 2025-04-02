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
		' text-muted focus-visible:ring-solar-500 grid size-12 place-items-center self-end rounded-lg hover:text-white focus-visible:ring-3 focus-visible:outline-hidden focus-visible:ring-inset',
		props.class
	)}
	{onclick}
>
	<XIcon />
</button>
