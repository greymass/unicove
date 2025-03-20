<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import Typography from './sections/typography.svelte';
	import Buttons from './sections/buttons.svelte';
	import Select from './sections/select.svelte';
	import Inputs from './sections/inputs.svelte';
	import Cards from './sections/cards.svelte';
	import Navigation from './sections/navigation.svelte';
	import Code from './sections/code.svelte';
	import Layouts from './sections/layouts.svelte';
	import Progress from './sections/progress.svelte';
	import Tables from './sections/tables.svelte';
	import Charts from './sections/charts.svelte';
	import Tooltips from './sections/tooltips.svelte';
	import Chips from './sections/chips.svelte';
</script>

<h1 class="h1 mb-8">Design System</h1>

{#snippet divider()}
	<hr class="bg-shark-900 my-8 h-px border-0" />
{/snippet}

<Stack class="space-y-12 pb-12">
	<Typography />

	{@render divider()}

	<Buttons />

	{@render divider()}

	<Chips />

	{@render divider()}

	<Cards />

	{@render divider()}

	<Navigation />

	{@render divider()}

	<Progress />

	{@render divider()}

	<Code />

	{@render divider()}

	<Tables />

	{@render divider()}

	<Charts />

	{@render divider()}

	<Select />

	{@render divider()}

	<Inputs />

	{@render divider()}

	<Layouts />

	{@render divider()}

	<Tooltips />
</Stack>
