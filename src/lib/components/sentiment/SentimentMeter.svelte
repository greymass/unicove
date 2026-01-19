<script lang="ts">
	import type { TopicStatistics } from '$lib/types/sentiment';

	interface Props {
		id: string;
		statistics: TopicStatistics;
	}

	const { statistics, ...props }: Props = $props();
</script>

<div class="grid gap-2">
	<div class="relative flex h-7 w-full items-center">
		{#if statistics.supportPercentage > 0 && statistics.oppositionPercentage > 0}
			<span
				class="bg-on-surface absolute top-0 h-full w-1 -translate-x-1 rounded-lg shadow"
				style="left: {statistics.supportPercentage}%"
			></span>
		{/if}

		<div class="h-5 flex-1 overflow-hidden rounded-lg">
			<progress
				class:bg-error={statistics.oppositionPercentage > 0}
				class:bg-surface-container-high={statistics.oppositionPercentage === 0}
				class="-webkit-progress-value:bg-success -webkit-progress-bar:bg-error bg-error h-full w-full"
				id={props.id}
				max="100"
				value={statistics.supportPercentage}
			>
			</progress>
		</div>
	</div>

	<label for={props.id} class="text-label-sm flex justify-between">
		<span
			class:text-success={statistics.supportPercentage > 0}
			class:text-muted={statistics.supportPercentage === 0}
		>
			{statistics.supportPercentage}% Support
		</span>
		<span
			class="text-right"
			class:text-error={statistics.oppositionPercentage > 0}
			class:text-muted={statistics.oppositionPercentage === 0}
		>
			{statistics.oppositionPercentage}% Oppose
		</span>
	</label>
</div>

<style>
	progress {
		-webkit-appearance: none;
		appearance: none;
		border: none;
	}

	/* Firefox foreground */
	progress::-moz-progress-bar {
		background: var(--color-success);
	}

	/* Chrome background */
	progress::-webkit-progress-bar {
		/* The value doesn't seem to matter, as long as it's set */
		background-color: transparent;
	}

	/* Chrome foreground */
	progress::-webkit-progress-value {
		background-color: var(--color-success);
	}
</style>
