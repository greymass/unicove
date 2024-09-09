<script lang="ts">
	import Circleprogress from '$lib/components/circleprogress.svelte';
	import { ResourceType } from '../../types';
	import { ResourceState } from '../../state.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import type { Resource } from '@wharfkit/account';

	interface Props {
		resource: ResourceType;
	}
	const { resource }: Props = $props();

	const context = getContext<UnicoveContext>('state');

	const resourceState = $state(new ResourceState(resource));
	$effect(() => {
		let resourceValue: Resource | undefined = undefined;
		switch (resource) {
			case ResourceType.RAM:
				resourceValue = context.account?.ram;
				break;
			case ResourceType.CPU:
				resourceValue = context.account?.cpu;
				break;
			case ResourceType.NET:
				resourceValue = context.account?.net;
				break;
		}
		resourceState.setResource(resourceValue);
	});
</script>

<div class="flex items-center gap-6">
	<div class="gauge">
		<Circleprogress percentage={resourceState.usagePerc}>{resourceState.usagePerc}%</Circleprogress>
	</div>
	<div>
		<h4>{resourceState.name}</h4>
		<h3>Resource Statistics</h3>
		<ul>
			<li>
				<span>Available:</span>
				<span>{resourceState.availableSize} {resourceState.unit}</span>
			</li>
			<li>
				<span>Used:</span>
				<span>{resourceState.usedSize} {resourceState.unit}</span>
			</li>
			<li>
				<span>Maximum:</span>
				<span>{resourceState.maxSize} {resourceState.unit}</span>
			</li>
		</ul>
	</div>
</div>
