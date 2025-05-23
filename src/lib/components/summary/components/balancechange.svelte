<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { EqualIcon } from 'lucide-svelte';
	import Chip from '$lib/components/chip.svelte';
	import type { Snippet } from 'svelte';
	import { ZeroUnits } from '$lib/types/token';
	import Row from './row.svelte';

	interface Props {
		account: NameType;
		balance: AssetType;
		delta: AssetType;
		children?: Snippet;
		perspectiveOf?: Name;
	}

	const { account, balance, delta, ...props }: Props = $props();
</script>

<Row>
	<Chip>Update</Chip>
	<span class="text-right text-nowrap">
		{#if Asset.from(delta).units.gt(ZeroUnits)}+{/if}
		<AssetElement value={Asset.from(delta)} variant="full" />
	</span>

	<AccountLink name={Name.from(account)} />

	<EqualIcon class="size-6" />

	<span class="text-nowrap">
		<span>New Balance:</span>
		<AssetElement value={Asset.from(balance)} variant="full" />
	</span>

	{#if props.children}
		<span>
			{@render props.children()}
		</span>
	{/if}
</Row>
