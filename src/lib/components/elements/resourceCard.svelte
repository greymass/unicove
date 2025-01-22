<script lang="ts">
	import { type Icon } from 'lucide-svelte';
	import CpuIcon from 'lucide-svelte/icons/cpu';
	import Wifi from 'lucide-svelte/icons/wifi';
	import HardDrive from 'lucide-svelte/icons/hard-drive';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		type: keyof typeof resourceMap;
		value: string;
		vertical?: boolean;
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
	<h3
		data-vertical={props.vertical}
		class="mb-4 flex items-center justify-between gap-4 text-xl font-bold data-[vertical=true]:mb-0 data-[vertical=true]:flex-col data-[vertical=true]:items-end"
	>
		{#if icon}
			{@const IconComponent = icon}
			<IconComponent class="size-6" />
		{/if}
		{title}
	</h3>

	<p class="*:block">
		<span class="font-semibold text-white">{props.value} {unit}</span>
		<span>{m.common_available()}</span>
	</p>
</div>
