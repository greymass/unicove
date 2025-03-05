<script lang="ts">
	import type { Int } from '@wharfkit/antelope';
	import ResourceCard from './resourceCard.svelte';

	interface Props {
		cpuAvailable: Int;
		netAvailable: Int;
	}

	const { cpuAvailable, netAvailable }: Props = $props();
</script>

<div class="flex gap-px *:flex-1 *:bg-mineShaft-900/70 *:p-4 *:pb-2">
	<div class="rounded-l-lg">
		<ResourceCard type="cpu" value={cpuAvailable} />
	</div>
	<div class="rounded-r-lg">
		<ResourceCard type="net" value={netAvailable} />
	</div>
</div>
