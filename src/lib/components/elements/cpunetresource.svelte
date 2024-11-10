<script lang="ts">
	import { CpuIcon, WifiIcon } from 'lucide-svelte';

	interface Props {
		cpuAvailable: number;
		netAvailable: number;
		precision?: number;
	}

	const { cpuAvailable, netAvailable, precision = 2 }: Props = $props();
</script>

<div class="flex gap-px text-right *:flex-1 *:bg-mineShaft-900/70 *:p-4 *:pb-2">
	<div class="rounded-l-lg">
		<h3 class="mb-4 flex items-center justify-between text-xl font-bold">
			<CpuIcon class="size-6" />
			CPU
		</h3>

		<p class="*:block">
			<span class="text-white"> {cpuAvailable.toFixed(precision)} ms </span>
			<span>Available</span>
		</p>
	</div>

	<div class="rounded-r-lg">
		<h3 class="mb-4 flex items-center justify-between text-xl font-bold">
			<WifiIcon class="size-6" />
			NET
		</h3>

		<p class="*:block">
			<span class="text-white"> {netAvailable.toFixed(precision)} kb </span>
			<span>Available</span>
		</p>
	</div>
</div>
