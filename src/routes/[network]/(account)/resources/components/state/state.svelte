<script lang="ts">
	import Circleprogress from '$lib/components/circleprogress.svelte';

	interface Props {
		name: string;
		available: string;
		used: string;
		max: string;
		percentage: number;
	}

	const { name, available, used, max, percentage }: Props = $props();
</script>

<div class="flex items-center gap-6">
	<div class="gauge">
		<Circleprogress {percentage}>{percentage}%</Circleprogress>
	</div>
	<div>
		<h4>{name}</h4>
		<h3>Resource Statistics</h3>

		<ul>
			<li>
				<span>Available:</span>
				<span>{available}</span>
			</li>
			<li>
				<span>Used:</span>
				<span>{used}</span>
			</li>
			<li>
				<span>Maximum:</span>
				<span>{max}</span>
			</li>
		</ul>
	</div>
</div>
