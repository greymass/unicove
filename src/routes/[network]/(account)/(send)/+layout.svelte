<script lang="ts">
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';
	import { page } from '$app/stores';

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

<PillGroup {options} class="mb-6 hidden" />

{@render children()}
