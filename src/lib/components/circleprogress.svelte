<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { type Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		percentage: number;
	}

	const { children, percentage = 0 }: Props = $props();

	const percentageAnimated = tweened(0, {
		duration: 400,
		easing: cubicInOut
	});
	const girth = 2 * Math.PI * 28;
	const dasharray = $derived(`${$percentageAnimated * girth},${girth}`);

	$effect(() => {
		percentageAnimated.set(percentage / 100);
	});
</script>

<div class="relative h-[80px] w-[80px]">
	<svg viewBox="0 0 60 60">
		<circle cx="30" cy="30" r="28" class="fill-none stroke-[#575757] stroke-[4]" />
		<circle
			cx="30"
			cy="30"
			r="28"
			transform="rotate(-90, 30, 30)"
			stroke-dasharray={dasharray}
			class="stroke-blue-400 fill-none stroke-[4]"
		/>
	</svg>
	{#if children}
		<div class="absolute inset-0 flex items-center justify-center">
			{@render children()}
		</div>
	{/if}
</div>
