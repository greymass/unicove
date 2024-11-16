<script lang="ts">
	import Renting from '../renting.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const network = data.network;
	const account = $derived(context.account);
</script>

<div class="container rounded-2xl py-5 pb-4 sm:bg-shark-900/20 sm:px-6 sm:pb-10">
	<Renting rentType="STAKE" {network} {account}></Renting>
</div>
