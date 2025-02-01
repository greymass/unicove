<script lang="ts">
	import Key from '$lib/components/elements/key.svelte';
	import CopyButton from '$lib/components/button/copy.svelte';
	import * as m from '$lib/paraglide/messages';
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import Contract from '$lib/components/elements/contract.svelte';

	const context = getContext<UnicoveContext>('state');

	interface Props {}
	let { abi, action, contract, network, ...props }: Props = $props();

	const ricardian = $derived.by(() => {
		try {
			console.log(action.ricardian_contract);
		} catch (e) {
			console.error(e);
		}
		return {
			summary: 'Error parsing Ricardian contract'
		};
	});
	const struct = $derived(abi.structs.find((s) => s.name === action.type));
	const response = $derived.by(() => {
		const resultType = abi.action_results.find((s) => s.name === action.name);
		if (resultType) {
			const resultStruct = abi.structs.find((s) => s.name === resultType.result_type);
			if (resultStruct) {
				return resultStruct.fields;
			}
			const resultArray = abi.structs.find((s) => s.name === parseType(resultType.result_type));
			if (resultArray) {
				return [
					{
						name: resultType.result_type,
						type: resultArray.name
					}
				];
			}
			return resultType;
		}
		return undefined;
	});

	function parseType(type: string) {
		// Remove suffix syntax (e.g. [], ?, !, $)
		return type.replace(/\[|\]|\?|\!|\$/g, '');
	}
</script>

<li class="relative col-span-full grid grid-cols-subgrid bg-shark-950">
	<dl
		class="z-20 col-span-full space-y-1 rounded-t-lg bg-mineShaft-950 px-4 py-3 md:col-span-1 md:rounded-l-lg"
	>
		<div>
			<div class="text-lg font-bold">Action</div>
			<dd class="font-semibold">
				<Contract name={contract} action={action.name}>
					{action.name}
				</Contract>
			</dd>
		</div>
	</dl>

	<div class="rounded-b-lg bg-mineShaft-950/50 px-4 py-3 md:rounded-r-lg">
		<div class="grid grid-cols-2 gap-4">
			<div>
				<div class="text-lg font-bold">Parameters</div>
				{#each struct.fields as field}
					{@const fieldType = abi.structs.find((s) => s.name === parseType(field.type))}
					<div>
						<span class="text-white">
							{field.name}
						</span>
						<span class="text-muted">
							{#if fieldType}
								<Contract name={contract} struct={fieldType.name}>
									{field.type}
								</Contract>
							{:else}
								{field.type}
							{/if}
						</span>
					</div>
				{:else}
					<span class="text-muted"> No action parameters. </span>
				{/each}
				{#if context.settings.data.debugMode}
					<Code>{JSON.stringify(struct, null, 2)}</Code>
				{/if}
			</div>
			<div>
				<div class="text-lg font-bold">Response Data</div>
				{#each response as field}
					{@const fieldType = abi.structs.find((s) => s.name === parseType(field.type))}
					<div>
						<span class="text-white">
							{field.name}
						</span>
						<span class="text-muted">
							{#if fieldType}
								<Contract name={contract} struct={fieldType.name}>
									{field.type}
								</Contract>
							{:else}
								{field.type}
							{/if}
						</span>
					</div>
				{:else}
					<p>No response data.</p>
				{/each}
				{#if context.settings.data.debugMode}
					<Code>{JSON.stringify(response, null, 2)}</Code>
				{/if}
			</div>
		</div>
	</div>
</li>
