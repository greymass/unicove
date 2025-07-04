<script lang="ts">
	import { ABI, Name } from '@wharfkit/antelope';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';

	import Contract from '$lib/components/elements/contract.svelte';
	import { parseRicardian } from '$lib/utils/ricardian';

	interface Props {
		action: ABI.Action;
		contract: Name;
	}
	let { action, contract }: Props = $props();

	const ricardian = $derived(parseRicardian(action));
</script>

<div class="flex items-center">
	<SquareTerminal class="mt-0.5 mr-2" />
	<Contract name={contract} action={Name.from(action.name)} class="text-3xl font-bold">
		{action.name}
	</Contract>
</div>

{#if ricardian}
	<p class="text-on-surface text-lg text-pretty">{ricardian.meta?.title}</p>
	<p class="text-muted text-sm text-balance">{ricardian.meta?.summary}</p>
{/if}
