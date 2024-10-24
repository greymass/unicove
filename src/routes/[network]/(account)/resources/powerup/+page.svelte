<script lang="ts">
	import Renting from '../components/renting.svelte';

	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	import { RentType } from '../types';

	const { data } = $props();

	const context = getContext<UnicoveContext>('state');

	const network = data.network;
	const account = $derived(context.account);

	function handleRent() {}
</script>

<div class="container rounded-2xl sm:bg-shark-900/20 sm:pb-10 sm:pt-6">
	<Renting rentType={RentType.POWERUP} {network} {account}></Renting>
</div>
