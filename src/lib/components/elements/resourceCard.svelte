<script lang="ts">
	import { type Icon } from 'lucide-svelte';
	import CpuIcon from 'lucide-svelte/icons/cpu';
	import Wifi from 'lucide-svelte/icons/wifi';
	import HardDrive from 'lucide-svelte/icons/hard-drive';

	interface Props {
		type: keyof typeof resourceMap;
		value: string;
	}

	type Resource = {
		title: string;
		icon: typeof Icon;
		unit: string;
	};

	const resourceMap: Record<string, Resource> = {
		cpu: {
			title: 'CPU',
			icon: CpuIcon,
			unit: 'ms'
		},
		net: {
			title: 'NET',
			icon: Wifi,
			unit: 'kb'
		},
		ram: {
			title: 'RAM',
			icon: HardDrive,
			unit: 'kb'
		}
	};

	const props: Props = $props();

	const { icon, title, unit } = $derived(resourceMap[props.type]);
</script>

<div class="text-right">
	<h3 class="mb-4 flex items-center justify-between text-xl font-bold">
		{#if icon}
			{@const IconComponent = icon}
			<IconComponent class="size-6" />
		{/if}
		{title}
	</h3>

	<p class="*:block">
		<span class="text-white">{props.value} {unit}</span>
		<span>Available</span>
	</p>
</div>
