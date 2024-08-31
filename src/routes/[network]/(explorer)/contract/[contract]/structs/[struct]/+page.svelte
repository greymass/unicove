<script lang="ts">
	import type { ABI } from '@wharfkit/antelope';

	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data }: { data: PageData } = $props();
	const struct = data.abi.structs.find((s: ABI.Struct) => s.name === data.struct);
</script>

{#if struct}
	<h1 class="h1">{struct.name}</h1>
	<p>
		The "{struct.name}" data type as defined in the
		<a href="/{data.network}/contract/{data.contract}">
			{data.contract}
		</a>
		smart contract on the {data.network.chain.name} network.
	</p>
	<Code lang="json">{JSON.stringify(struct, null, 2)}</Code>
{/if}
