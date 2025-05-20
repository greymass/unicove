<script lang="ts">
	import { Int64, type Int } from '@wharfkit/antelope';

	import NumberText from '$lib/components/elements/number.svelte';

	interface Props {
		number: Int;
		colored: boolean;
	}

	let { number, colored = false }: Props = $props();

	const positiveClasses = colored ? 'text-green-500' : '';
	const negativeClasses = colored ? 'text-error' : '';
	const neutralClasses = '';
</script>

{#if number.lt(Int64.from(0))}
	<NumberText number={Number(number) * -1} class={positiveClasses} prefix />
{:else if number.gt(Int64.from(0))}
	<NumberText number={-number} class={negativeClasses} />
{:else}
	<NumberText {number} class={neutralClasses} />
{/if}
