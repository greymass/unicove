<script lang="ts">
	import { TokenBalance } from '@wharfkit/common';
	import { Card } from '../layout';
	interface Props {
		token?: TokenBalance;
		title: string;
		description: string;
	}

	const { token, title, description }: Props = $props();
</script>

<Card class="min-h-28 bg-mineShaft-900/70 p-4 text-right">
	<div class="flex items-center justify-between">
		<img src={token?.metadata.logo} class="size-6" alt="token icon" />
		<h5 class="text-xl font-bold">{title}</h5>
	</div>
	<p class="*:block">
		<span class="text-white">{token?.asset}</span>
		<span>{description}</span>
	</p>
</Card>
