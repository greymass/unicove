<script lang="ts" module>
	export type FinalityView = 'status' | 'producers' | 'blocks';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const { view }: { view: FinalityView } = $props();

	const tabs: { view: FinalityView; label: string }[] = $derived([
		{ view: 'status', label: 'Status' },
		{ view: 'producers', label: 'Producers and finalizers' },
		{ view: 'blocks', label: 'Blocks' }
	]);

	function select(next: FinalityView) {
		const url = new URL(page.url);
		if (next === 'status') url.searchParams.delete('view');
		else url.searchParams.set('view', next);
		url.searchParams.delete('at');
		url.hash = '';
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}
</script>

<div class="border-outline-variant flex gap-1 overflow-x-auto border-b" role="tablist">
	{#each tabs as tab (tab.view)}
		<button
			role="tab"
			aria-selected={view === tab.view}
			class="-mb-px cursor-pointer border-b-2 px-3 py-2 whitespace-nowrap {view === tab.view
				? 'border-primary text-on-surface'
				: 'text-muted hover:text-on-surface border-transparent'}"
			onclick={() => select(tab.view)}
		>
			{tab.label}
		</button>
	{/each}
</div>
