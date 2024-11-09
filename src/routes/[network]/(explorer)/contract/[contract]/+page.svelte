<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	// import Pageheader from '$lib/components/pageheader.svelte';
	import * as m from '$lib/paraglide/messages.js';

	const { data } = $props();
</script>

<!-- <Stack> -->
<!-- <Pageheader -->
<!-- 	title="Contract Overview" -->
<!-- 	subtitle={m.contract_view_description({ -->
<!-- 		contract: String(data.contract), -->
<!-- 		network: data.network.chain.name, -->
<!-- 		tables: data.abi.tables.length, -->
<!-- 		structs: data.abi.structs.length, -->
<!-- 		actions: data.abi.actions.length -->
<!-- 	})} -->
<!-- /> -->
<!-- </Stack> -->
