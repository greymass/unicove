<script lang="ts">
	import type { Int } from '@wharfkit/antelope';
	import { type Icon } from 'lucide-svelte';
	import CpuIcon from 'lucide-svelte/icons/cpu';
	import Wifi from 'lucide-svelte/icons/wifi';
	import HardDrive from 'lucide-svelte/icons/hard-drive';

	import * as m from '$lib/paraglide/messages';
	import NumberFormat from '$lib/components/elements/number.svelte';

	interface Props {
		type: keyof typeof resourceMap;
		value: Int;
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

<div class="text-right @xl:grid @xl:justify-center @xl:gap-2">
	<h3
		data-vertical={props.vertical}
		class="flex flex-col items-end gap-2 text-xl font-bold @xl:flex-row @xl:items-center @xl:justify-between"
	>
		{#if icon}
			{@const IconComponent = icon}
			<IconComponent class="size-6" />
		{/if}
		{title}
	</h3>

	<p class="mt-0.5 flex-wrap gap-x-2 *:block @xl:flex">
		<span class="text-on-surface font-semibold">
			<NumberFormat number={props.value.dividing(1000)} />
			{unit}
		</span>
		<span>{m.common_available()}</span>
	</p>
</div>
