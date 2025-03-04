<script lang="ts">
	import { UInt64, type Asset } from '@wharfkit/antelope';
	import type { HTMLAttributes } from 'svelte/elements';

	import AssetText from '$lib/components/elements/asset.svelte';
	import type { MarketContext, UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';
	import { Currencies } from '$lib/types/currencies';
	import type { TokenDefinition } from '$lib/types/token';

	const context = getContext<UnicoveContext>('state');
	const market = getContext<MarketContext>('market');

	interface ValueProps extends HTMLAttributes<HTMLSpanElement> {
		token: TokenDefinition;
		balance: Asset;
	}

	let { balance, token, ...props }: ValueProps = $props();

	const currency = Currencies[context.settings.data.displayCurrency];
	const same = $derived(token.equals(currency));
	const value = $derived(same ? balance : market.market.value(token, currency, balance));
	const mutedClass = $derived(value.units.equals(UInt64.from(0)) ? 'text-muted' : '');
</script>

<AssetText class={mutedClass} {value} {...props} />
