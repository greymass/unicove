<script lang="ts">
	import RamIcon from '$lib/assets/resources/ram.svg';

	interface Props {
		ramAvailable: number;
		precision?: number;
	}

	const { ramAvailable, precision = 2 }: Props = $props();
</script>

<div class="relative h-28 rounded-lg bg-[#303338]">
	<div class="absolute left-4 top-3"><img src={RamIcon} class="size-6" alt="ram icon" /></div>
	<div class="absolute right-3 top-3 text-xl font-bold">RAM</div>
	<div class="absolute bottom-2 right-3">
		<h5 class="h5 text-right">{ramAvailable.toFixed(precision)} kb</h5>
		<p>Available</p>
	</div>
</div>
