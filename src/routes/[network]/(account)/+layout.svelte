<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import { page } from '$app/stores';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	// Effect to handle network change redirects in the account section
	$effect(() => {
		if (
			data.network.chain.id &&
			context.account &&
			!context.account.network.chain.equals(data.network.chain)
		) {
			const path = $page.url.pathname.replace(`/${languageTag()}/${data.network}/`, '');
			const redirect = `/${languageTag()}/${context.account.network}/${path}`;
			goto(redirect);
		}
	});
</script>

{@render children()}
