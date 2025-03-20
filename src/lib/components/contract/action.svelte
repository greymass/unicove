<script lang="ts">
	import { getContext } from 'svelte';
	import { Name, type ABI } from '@wharfkit/antelope';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { NetworkState } from '$lib/state/network.svelte';

	import ContractActionOverview from '$lib/components/contract/action/overview.svelte';
	import ContractActionParams from '$lib/components/contract/action/params.svelte';
	import ContractActionResponse from '$lib/components/contract/action/response.svelte';
	import Code from '$lib/components/code.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		abi: ABI;
		action: ABI.Action;
		contract: Name;
		network: NetworkState;
	}
	let { abi, action, contract }: Props = $props();

	const struct = $derived(abi.structs.find((s) => s.name === action.type));
	const actionResult = $derived(abi.action_results.find((s) => s.name === action.name));
</script>

<li class="relative col-span-full grid grid-cols-subgrid bg-shark-950">
	<div
		class="col-span-full space-y-1 rounded-t-lg bg-mine-950 px-4 py-3 md:col-span-1 md:max-w-xs md:rounded-l-lg"
	>
		<ContractActionOverview {action} {contract} />
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="rounded-b-lg bg-mine-950/50 px-4 py-3 md:rounded-r-lg">
			{#if struct}
				<ContractActionParams {abi} {contract} {struct} />
			{/if}
			{#if context.settings.data.debugMode}
				<Code>{JSON.stringify(struct, null, 2)}</Code>
			{/if}
		</div>
		<div class="rounded-b-lg bg-mine-950/50 px-4 py-3 md:rounded-r-lg">
			{#if actionResult}
				<ContractActionResponse {abi} {contract} {actionResult} />
			{/if}
			{#if context.settings.data.debugMode}
				<Code>{JSON.stringify(actionResult, null, 2)}</Code>
			{/if}
		</div>
	</div>
</li>
