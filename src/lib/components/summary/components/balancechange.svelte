<script lang="ts">
	import { Asset, Name, type AssetType, type NameType } from '@wharfkit/antelope';

	import AccountLink from '$lib/components/elements/account.svelte';
	import AssetElement from '$lib/components/elements/asset.svelte';
	import { EqualIcon } from 'lucide-svelte';
	import Chip from '$lib/components/chip.svelte';
	import type { Snippet } from 'svelte';
	import { ZeroUnits } from '$lib/types/token';

	interface Props {
		account: NameType;
		balance: AssetType;
		delta: AssetType;
		children?: Snippet;
		perspectiveOf?: Name;
	}

	const { account, balance, delta, ...props }: Props = $props();
</script>

<Chip class="col-start-1 col-end-2 w-full text-center">Update</Chip>
<span class="col-start-2 col-end-4 text-right">
	{#if Asset.from(delta).units.gt(ZeroUnits)}
		+
	{/if}
	<AssetElement value={Asset.from(delta)} variant="full" />
</span>
<span class="col-start-4 col-end-5">
	<AccountLink name={Name.from(account)} />
</span>
<div class="col-start-5 col-end-6 items-center justify-self-center">
	<EqualIcon />
</div>
<span class="col-start-6 col-end-12 flex gap-2">
	<span>New Balance:</span>
	<AssetElement value={Asset.from(balance)} variant="full" />
</span>

{#if props.children}
	<span>
		{@render props.children()}
	</span>
{/if}
