<script lang="ts">
	import type { MinutePoint } from '$lib/state/finality/derive';

	interface Props {
		points: MinutePoint[];
		p99: number | null;
	}

	const { points, p99 }: Props = $props();

	const WIDTH = 280;
	const HEIGHT = 44;
	const SPAN_MS = 15 * 60_000;

	const geometry = $derived.by(() => {
		const last = points[points.length - 1];
		if (!last) return null;
		const end = last.minute;
		const start = end - SPAN_MS + 60_000;
		const values = points.map((point) => point.p90).filter((v): v is number => v !== null);
		const max = Math.max(2000, ...values, p99 ?? 0);
		const x = (minute: number) => ((minute - start) / (end - start || 1)) * WIDTH;
		const y = (value: number) => HEIGHT - 2 - (value / max) * (HEIGHT - 4);
		let path = '';
		let gap = true;
		for (const point of points) {
			if (point.p90 === null || point.minute < start) {
				gap = true;
				continue;
			}
			// @wc-ignore
			path += `${gap ? 'M' : 'L'}${x(point.minute).toFixed(1)},${y(point.p90).toFixed(1)}`;
			gap = false;
		}
		return { path, baseline: p99 === null ? null : y(p99) };
	});
</script>

<svg
	viewBox="0 0 {WIDTH} {HEIGHT}"
	preserveAspectRatio="none"
	class="block h-11 w-full overflow-visible"
	role="img"
	aria-label="Time to final p90 per minute, last 15 min"
>
	{#if geometry}
		{#if geometry.baseline !== null}
			<line
				x1="0"
				x2={WIDTH}
				y1={geometry.baseline}
				y2={geometry.baseline}
				class="stroke-primary opacity-50"
				vector-effect="non-scaling-stroke"
			/>
		{/if}
		<path
			d={geometry.path}
			fill="none"
			class="stroke-on-surface-variant"
			stroke-width="1.5"
			stroke-linejoin="round"
			vector-effect="non-scaling-stroke"
		/>
	{/if}
</svg>
