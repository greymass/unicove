<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { Name, type ABI, type NameType } from '@wharfkit/antelope';
	import type { NetworkState } from '$lib/state/network.svelte';
	import Braces from 'lucide-svelte/icons/braces';
	import Brackets from 'lucide-svelte/icons/brackets';
	import { SquareTerminal } from 'lucide-svelte';
	import { parse } from 'yaml';
	import { parseRicardian } from '$lib/utils/ricardian';

	const context = getContext<UnicoveContext>('state');

	interface Props {
		abi: ABI;
		action: ABI.Action;
		contract: Name;
		network: NetworkState;
	}
	let { abi, action, contract, network }: Props = $props();

	const ricardian = $derived(parseRicardian(action));

	const struct = $derived(abi.structs.find((s) => s.name === action.type));
	const response: ABI.Field[] = $derived.by(() => {
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
						name: '...',
						type: resultType.result_type
					}
				];
			}
			return [
				{
					name: String(resultType.name),
					type: resultType.result_type
				}
			];
		}
		return [];
	});

	const arrayResponse = $derived.by(() => {
		// string ends with []

		return response.length && response[0].type.endsWith('[]');
	});

	function parseType(type: string) {
		// Remove suffix syntax (e.g. [], ?, !, $)
		return type.replace(/\[|\]|\?|\!|\$/g, '');
	}
</script>

<li class="relative col-span-full grid grid-cols-subgrid bg-shark-950">
	<div
		class="col-span-full space-y-1 rounded-t-lg bg-mineShaft-950 px-4 py-3 md:col-span-1 md:max-w-xs md:rounded-l-lg"
	>
		<div class="flex items-center">
			<SquareTerminal class="mr-2" />
			<Contract name={contract} action={Name.from(action.name)} class="text-3xl font-bold">
				{action.name}
			</Contract>
		</div>
		{#if ricardian}
			<p class="text-md text-white">{ricardian.meta?.title}</p>
			<p class="text-muted text-sm">{ricardian.meta?.summary}</p>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div class="rounded-b-lg bg-mineShaft-950/50 px-4 py-3 md:rounded-r-lg">
			{#if struct}
				<table class="table-styles">
					<thead>
						<tr>
							<th colspan="2" class="flex items-center text-lg font-bold">
								Request Parameters
								<Braces class="ml-2 inline" />
							</th>
						</tr>
					</thead>
					<tbody>
						{#each struct.fields as field}
							{@const fieldType = abi.structs.find((s) => s.name === parseType(field.type))}
							<tr>
								<td>
									<span class="text-white">
										{field.name}
									</span>
								</td>
								<td>
									{#if fieldType}
										<Contract name={contract} struct={fieldType.name}>
											{field.type}
										</Contract>
									{:else}
										{field.type}
									{/if}
								</td>
							</tr>
						{:else}
							<tr>
								<td class="text-muted" colspan="2"> No action parameters. </td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			<!-- <Button
					class="mt-2"
					href={`/${network}/contract/${contract}/actions/${action.name}`}
					variant="secondary"
				>
					Perform Action
				</Button> -->
			{#if context.settings.data.debugMode}
				<Code>{JSON.stringify(struct, null, 2)}</Code>
			{/if}
		</div>
		<div class="rounded-b-lg bg-mineShaft-950/50 px-4 py-3 md:rounded-r-lg">
			<table class="table-styles">
				<thead>
					<tr>
						<th colspan="2" class="flex items-center text-lg font-bold">
							{#if arrayResponse}
								Response Array
								<Brackets class="ml-2 inline" />
							{:else}
								Response Object
								<Braces class="ml-2 inline" />
							{/if}
						</th>
					</tr>
				</thead>
				<tbody>
					{#each response as field}
						{@const fieldType = abi.structs.find((s) => s.name === parseType(field.type))}
						<tr>
							<td>
								<span class="text-white">
									{field.name}
								</span>
							</td>
							<td>
								{#if fieldType}
									<Contract name={contract} struct={fieldType.name}>
										{field.type}
									</Contract>
								{:else}
									{field.type}
								{/if}
							</td>
						</tr>
					{:else}
						<tr>
							<td class="text-muted" colspan="2"> No data in response. </td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</li>
