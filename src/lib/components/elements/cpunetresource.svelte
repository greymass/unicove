<script lang="ts">
	import { CpuIcon, WifiIcon } from 'lucide-svelte';

	interface Props {
		cpuAvailable: number;
		netAvailable: number;
		precision?: number;
	}

	const { cpuAvailable, netAvailable, precision = 2 }: Props = $props();
</script>

<div class="flex gap-px">
	<div class="relative h-28 flex-1 rounded-l-xl bg-[#303338]">
		<div class="absolute left-4 top-5">
			<CpuIcon class="size-6" />
		</div>
		<div class="absolute right-3 top-3 text-xl font-bold">CPU</div>
		<div class="absolute bottom-2 right-3">
			<h5 class="h5 text-right">{cpuAvailable.toFixed(precision)} ms</h5>
			<p>Available</p>
		</div>
	</div>
	<div class="relative h-28 flex-1 rounded-r-xl bg-[#303338]">
		<div class="absolute left-5 top-4">
			<WifiIcon class="size-6" />
		</div>
		<div class="absolute right-4 top-3 text-xl font-bold">NET</div>
		<div class="absolute bottom-2 right-4">
			<h5 class="h5 text-right">{netAvailable.toFixed(precision)} kb</h5>
			<p>Available</p>
		</div>
	</div>
</div>
