<script lang="ts">
	import type { Int } from '@wharfkit/antelope';
	import ResourceCard from './resourceCard.svelte';

	interface Props {
		cpuAvailable: Int;
		netAvailable: Int;
	}

	const { cpuAvailable, netAvailable }: Props = $props();
</script>

<div class="*:bg-surface-container-high flex gap-px *:flex-1 *:p-4 *:pb-2">
	<div class="rounded-l-xl">
		<ResourceCard type="cpu" value={cpuAvailable} />
	</div>
	<div class="rounded-r-xl">
		<ResourceCard type="net" value={netAvailable} />
	</div>
</div>
