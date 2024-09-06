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
</script>

<h1 class="h1 mb-8">Design System</h1>

<Stack class="space-y-12">
	<Typography />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Buttons />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Select />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Inputs />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Cards />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Navigation />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Progress />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Code />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Tables />

	<hr class="my-8 h-px border-0 bg-slate-200 dark:bg-slate-800" />

	<Layouts />
</Stack>
