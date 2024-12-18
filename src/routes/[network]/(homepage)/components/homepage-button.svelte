<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { ArrowRight } from 'lucide-svelte';

	interface Props {
		text: string;
		href: string;
		icon?: boolean;
	}
	let props: Props = $props();
</script>

<Button
	class="-mt-2 bg-transparent px-0 text-solar-500 hover:active:bg-transparent hover:active:text-solar-600 [@media(any-hover:hover)]:hover:bg-transparent [@media(any-hover:hover)]:hover:text-solar-400"
	href={props.href}
>
	<span class="inline-flex items-center gap-1">
		{props.text}

		{#if props.icon}
			<ArrowRight class="size-5" />
		{/if}
	</span>
</Button>
