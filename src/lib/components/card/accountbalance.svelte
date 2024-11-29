<script lang="ts">
	import Button from '../button/button.svelte';
	import Chip from '../chip.svelte';
	import { Card, Stack } from '../layout';
	import AssetText from '$lib/components/elements/asset.svelte';
	import { Asset } from '@wharfkit/antelope';

	interface Props {
		balance: Asset;
		cta?: {
			label: string;
			href: string;
		};
		title: string;
		value?: Asset;
	}

	const { balance, cta, title, value }: Props = $props();
</script>

<Card {title}>
	<Stack>
		<Stack class="gap-2">
			<h4 class="text-muted text-base leading-none">Available</h4>
			<p class="text-xl font-semibold leading-none text-white">
				<AssetText variant="full" value={balance} />
			</p>
			{#if value}
				<Chip>
					<AssetText variant="full" {value} />
					<!-- TODO: Percent change -->
				</Chip>
			{/if}
		</Stack>

		{#if cta}
			<Stack class="gap-2">
				<Button href={cta.href}>{cta.label}</Button>
			</Stack>
		{/if}
	</Stack>
</Card>
