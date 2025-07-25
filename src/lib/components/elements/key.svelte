<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Key as KeyElement, type KeyProps } from 'unicove-components';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	let props: Omit<KeyProps, 'href'> = $props();

	const href = $derived(`/${network}/key/${String(props.key)}`);
</script>

<KeyElement {...props} {href} />
