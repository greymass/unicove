<script lang="ts">
	import { Block, type BlockProps } from 'unicove-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	let props: Omit<BlockProps, 'href'> = $props();

	let { network } = getContext<UnicoveContext>('state');

	const href = $derived(`/${network}/block/${String(props.number)}`);
</script>

<Block {...props} {href} />
