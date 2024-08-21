<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		inverted?: boolean;
	}
	let props: Props = $props();
</script>

<header class="flex gap-2" class:flex-col={!props.inverted} class:flex-col-reverse={props.inverted}>
	<h1 class="text-3xl font-bold leading-none text-white">{props.title}</h1>
	{#if props.subtitle}
		<h2 class="text-xl font-medium leading-none text-white/60">{props.subtitle}</h2>
	{/if}
</header>
