<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Key as KeyElement, type KeyProps } from 'unicove-components';
	import { getContext } from 'svelte';

	const { urlPath } = getContext<UnicoveContext>('state');

	let props: Omit<KeyProps, 'href'> = $props();

	const href = $derived(urlPath(`/key/${String(props.key)}`));
</script>

<KeyElement {...props} {href} />
