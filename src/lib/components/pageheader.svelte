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

	const titleStyle = 'text-3xl font-bold leading-none text-white';
	const subtitleStyle = 'text-xl font-medium leading-none text-white/60';
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

	<div class="grid gap-2">
		<h1 class={props.inverted ? subtitleStyle : titleStyle}>{props.title}</h1>
		{#if props.subtitle}
			<h2 class={props.inverted ? titleStyle : subtitleStyle}>{props.subtitle}</h2>
		{/if}
	</div>
</header>
