<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import { page } from '$app/stores';

	const { children, data } = $props();
	const context = getContext<UnicoveContext>('state');

	// When an account changes, redirect any account-based URL (/send, /ram, etc) to
	// the network matching the account.
	$effect(() => {
		if (context.account && !context.account.network.chain.equals(data.network.chain)) {
			goto(
				$page.url.pathname.replace(
					`/${languageTag()}/${data.network}/`,
					`/${languageTag()}/${context.account.network}/`
				)
			);
		}
	});
</script>

{@render children()}
