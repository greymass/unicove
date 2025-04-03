<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { cn } from '$lib/utils/style';
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		text: string;
		href: string;
		icon?: boolean;
		class?: string;
	}
	let props: Props = $props();
</script>

<Button
	class={cn(
		'text-solar-500 hover:active:text-solar-600 hover:text-solar-400 -mt-2 bg-transparent px-0 hover:bg-transparent hover:active:bg-transparent',
		props.class
	)}
	href={props.href}
>
	<span class="inline-flex items-center gap-1">
		{props.text}

		{#if props.icon}
			<ArrowRight class="size-5" />
		{/if}
	</span>
</Button>
