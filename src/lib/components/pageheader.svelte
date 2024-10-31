<script lang="ts">
	import { ChevronLeft } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	interface Props {
		title: string;
		subtitle?: string;
		inverted?: boolean;
		backPath?: string;
	}
	let props: Props = $props();

	function goBack() {
		if (props.backPath) {
			goto(props.backPath);
		} else {
			history.back();
		}
	}
</script>

<header class="flex items-center gap-4">
	{#if props.backPath}
		<button
			onclick={goBack}
			class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-sky-400 hover:text-sky-300 focus:outline-none"
		>
			<ChevronLeft size={24} />
		</button>
	{/if}
	<div class="flex gap-2" class:flex-col={!props.inverted} class:flex-col-reverse={props.inverted}>
		<h1 class="text-3xl font-bold leading-none text-white">{props.title}</h1>
		{#if props.subtitle}
			<h2 class="text-xl font-medium leading-none text-white/60">{props.subtitle}</h2>
		{/if}
	</div>
</header>
