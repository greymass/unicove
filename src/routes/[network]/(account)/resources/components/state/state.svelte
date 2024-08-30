<script lang="ts">
	import Circleprogress from '$lib/components/circleprogress.svelte';
	import { ResourceType } from '../../types.svelte';

	interface Props {
		resource: ResourceType;
		available: string;
		used: string;
		max: string;
		percentage: number;
	}

	const { resource, available, used, max, percentage }: Props = $props();

	const resourceName = resource === ResourceType.CPU ? 'CPU' : 'NET';
	const resourceUnit = resource === ResourceType.CPU ? 'ms' : 'kb';
</script>

<div class="flex items-center gap-6">
	<div class="gauge">
		<Circleprogress {percentage}>{percentage}%</Circleprogress>
	</div>
	<div>
		<h4>{resourceName}</h4>
		<h3>Resource Statistics</h3>

		<ul>
			<li>
				<span>Available:</span>
				<span>{available}</span>
			</li>
			<li>
				<span>Used:</span>
				<span>{used}</span>
			</li>
			<li>
				<span>Maximum:</span>
				<span>{max}</span>
			</li>
		</ul>
	</div>
</div>
