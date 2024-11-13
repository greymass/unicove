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
</script>

<h1 class="h1 mb-8">Design System</h1>

<Stack class="space-y-12 pb-12">
	<Typography />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Buttons />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Select />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Inputs />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Cards />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Navigation />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Progress />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Code />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Tables />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Charts />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Layouts />

	<hr class="bg-slate-200 dark:bg-slate-800 my-8 h-px border-0" />

	<Tooltips />
</Stack>
