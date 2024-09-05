<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/stores';
	import Pageheader from '$lib/components/pageheader.svelte';
	import Stack from '$lib/components/layout/stack.svelte';

	const { children, data } = $props();

	const tabOptions = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/send`, text: 'Send' },
			{ href: `/${network}/receive`, text: 'Receive' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/')[3]);

	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/')[2] === currentTab
		}))
	);
</script>

<Stack>
	<Pageheader title="Send" subtitle="Send tokens" />

	<PillGroup {options} class="mb-6" />

	{@render children()}
</Stack>
