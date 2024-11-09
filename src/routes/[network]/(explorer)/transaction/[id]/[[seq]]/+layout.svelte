<script lang="ts">
	import { page } from '$app/stores';
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	const tabOptions = $derived.by(() => {
		let urlBase = `/${data.network}/transaction/${data.id}`;
		if (data.seq) {
			urlBase += `/${data.seq}`;
		}
		return [
			{ href: urlBase, text: 'Summary' },
			// { href: `${urlBase}/resources`, text: 'Resources' },
			{ href: `${urlBase}/data`, text: 'Data' }
		];
	});

	let currentTab = $derived($page.url.pathname.split('/').slice(2)[3]);

	// Derive the active state of each destination
	let options = $derived(
		tabOptions.map((option) => ({
			...option,
			active: option.href.split('/').slice(2)[2] === currentTab
		}))
	);
</script>

<PillGroup {options} />

{@render children()}
