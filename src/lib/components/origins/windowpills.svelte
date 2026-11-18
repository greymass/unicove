<script lang="ts">
	import type { StatWindow } from '$lib/state/statindex/utils';

	interface Props {
		value: StatWindow;
	}

	let { value = $bindable() }: Props = $props();

	const options: { window: StatWindow; label: string }[] = [
		{ window: '30d', label: '30D' },
		{ window: '90d', label: '90D' },
		{ window: '365d', label: '1Y' },
		{ window: 'all', label: 'All' }
	];
</script>

<div class="bg-surface-container-high flex rounded-lg p-0.5 text-xs">
	{#each options as option (option.window)}
		<button
			type="button"
			onclick={() => (value = option.window)}
			aria-pressed={value === option.window}
			class="text-muted aria-pressed:bg-surface-container-highest aria-pressed:text-on-surface rounded-md px-2.5 py-1 font-medium transition-colors"
		>
			{option.label}
		</button>
	{/each}
</div>
