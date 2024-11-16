<script>
	import { Stack } from '$lib/components/layout';
	import BarChart from '$lib/components/chart/barchart.svelte';
</script>

<Stack id="charts">
	<h2 class="h2">Charts</h2>
	<h3 class="h3">Bar Chart</h3>
	<BarChart data={[]} title="Staking Yield History" />
</Stack>
