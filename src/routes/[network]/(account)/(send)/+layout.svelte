<script lang="ts">
	import PillGroup from '$lib/components/navigation/pillgroup.svelte';

	const { children, data } = $props();

	const options = $derived.by(() => {
		const network = String(data.network);
		return [
			{ href: `/${network}/send`, text: 'Send' },
			{ href: `/${network}/receive`, text: 'Receive' }
		];
	});
</script>

<PillGroup {options} class="mb-6 hidden" />

{@render children()}
