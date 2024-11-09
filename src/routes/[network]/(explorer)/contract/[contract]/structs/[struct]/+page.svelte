<script lang="ts">
	import type { ABI } from '@wharfkit/antelope';

	import type { PageData } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';
	import { Stack } from '$lib/components/layout';
	// import Pageheader from '$lib/components/pageheader.svelte';

	const { data }: { data: PageData } = $props();
	const struct = data.abi.structs.find((s: ABI.Struct) => s.name === data.struct);
</script>

<Stack>
	<!-- <Pageheader -->
	<!-- 	title={m.contract_struct_view_title({ struct: data.struct })} -->
	<!-- 	subtitle={m.contract_struct_view_description({ -->
	<!-- 		struct: data.struct, -->
	<!-- 		contract: String(data.contract), -->
	<!-- 		network: data.network.chain.name -->
	<!-- 	})} -->
	<!-- /> -->
	<Code lang="json">{JSON.stringify(struct, null, 2)}</Code>
</Stack>
