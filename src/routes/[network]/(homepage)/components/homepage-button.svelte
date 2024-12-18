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
		'-mt-2 bg-transparent px-0 text-solar-500 hover:active:bg-transparent hover:active:text-solar-600 [@media(any-hover:hover)]:hover:bg-transparent [@media(any-hover:hover)]:hover:text-solar-400',
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
