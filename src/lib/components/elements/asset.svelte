<script lang="ts">
	import { Asset as AssetElement, type AssetProps } from 'unicove-components';
	import { languageTag } from '$lib/paraglide/runtime.js';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	let props: AssetProps = $props();

	const context = getContext<UnicoveContext>('state');
	const increasedPrecision = $derived(context.settings.data.increasedPrecision);

	const locale = languageTag();
</script>

<AssetElement {...props} {increasedPrecision} {locale} />
