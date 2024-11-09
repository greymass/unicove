<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte.js';
	import { goto } from '$app/navigation';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import { Stack } from '$lib/components/layout';

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

<Stack tag="article" class="gap-6">
	<Pageheader
		network={data.network}
		title={$page.data.title}
		subtitle={$page.data.subtitle}
		backPath={$page.data.backPath}
	/>

	{@render children()}
</Stack>
