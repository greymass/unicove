<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
		inverted?: boolean;
	}
	let props: Props = $props();

	const titleStyle = 'text-3xl font-bold leading-none text-white';
	const subtitleStyle = 'text-xl font-medium leading-none text-white/60';
</script>

<header class="grid gap-2">
	<h1 class={props.inverted ? subtitleStyle : titleStyle}>{props.title}</h1>
	{#if props.subtitle}
		<h2 class={props.inverted ? titleStyle : subtitleStyle}>{props.subtitle}</h2>
	{/if}
</header>
