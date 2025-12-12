<script lang="ts">
	import { Card, Stack } from 'unicove-components';

	interface EmptyStateProps {
		title: string;
		message: string;
	}

	const { title, message }: EmptyStateProps = $props();
</script>

<Card>
	<Stack class="py-8 text-center">
		<h3 class="text-title">{title}</h3>
		<p class="text-muted">{message}</p>
	</Stack>
</Card>
