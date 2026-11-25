<script lang="ts">
	import { Chip, cn } from '@wharfkit/svelte-components';
	import { Shield } from '@lucide/svelte';

	interface Props {
		active: boolean;
		responsive?: boolean;
	}

	let { active, responsive = false }: Props = $props();
</script>

{#if active}
	<Chip class={cn('bg-success text-on-success text-label-sm', responsive && 'hidden @lg:block')}>
		Active
	</Chip>
	{#if responsive}
		<Shield class="fill-success text-success @lg:hidden" />
	{/if}
{:else}
	<Chip
		class={cn(
			'bg-surface-container-high text-muted text-label-sm',
			responsive && 'hidden @lg:block'
		)}
	>
		Standby
	</Chip>
	{#if responsive}
		<Shield class="text-surface-container-highest fill-surface-container-highest @lg:hidden" />
	{/if}
{/if}
