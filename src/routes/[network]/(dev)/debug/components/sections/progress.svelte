<script>
	import { Stack } from '$lib/components/layout';
	import Progress from '$lib/components/progress.svelte';
</script>

<Stack id="Progress">
	<h2 class="h2">Progress</h2>

	<Progress currentStep={1} maxStep={3} />
	<Progress currentStep={4} maxStep={6} />
</Stack>
