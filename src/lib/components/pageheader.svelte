<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
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
		<button onclick={goBack} class="text-white hover:text-white/80 focus:outline-none">
			<ArrowLeft size={24} />
		</button>
	{/if}
	<div class="flex gap-2" class:flex-col={!props.inverted} class:flex-col-reverse={props.inverted}>
		<h1 class="text-3xl font-bold leading-none text-white">{props.title}</h1>
		{#if props.subtitle}
			<h2 class="text-xl font-medium leading-none text-white/60">{props.subtitle}</h2>
		{/if}
	</div>
</header>
