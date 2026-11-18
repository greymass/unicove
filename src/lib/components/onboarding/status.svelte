<script lang="ts">
	import { statusLabel } from './labels.svelte';

	interface Props {
		suspended?: boolean;
		enabled?: boolean;
		removed?: boolean;
	}

	const { suspended = false, enabled = true, removed = false }: Props = $props();
	const status = $derived(
		removed ? 'removed' : !enabled ? 'off' : suspended ? 'suspended' : 'gifting'
	);
	const tone = $derived(
		status === 'gifting'
			? 'bg-primary/10 text-primary'
			: status === 'suspended'
				? 'bg-error/15 text-error'
				: 'bg-surface-container-high text-muted'
	);
</script>

<span class="text-label-sm rounded-full px-2.5 py-0.5 whitespace-nowrap {tone}">
	{statusLabel(status)}
</span>
