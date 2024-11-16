<script lang="ts">
	import ResourceCard from './resourceCard.svelte';

	interface Props {
		cpuAvailable: number;
		netAvailable: number;
		precision?: number;
	}

	const { cpuAvailable, netAvailable, precision = 2 }: Props = $props();
</script>

<div class="flex gap-px *:flex-1 *:bg-mineShaft-900/70 *:p-4 *:pb-2">
	<div class="rounded-l-lg">
		<ResourceCard type="cpu" value={cpuAvailable.toFixed(precision)} />
	</div>
	<div class="rounded-r-lg">
		<ResourceCard type="net" value={netAvailable.toFixed(precision)} />
	</div>
</div>
