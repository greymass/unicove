<script lang="ts">
	import { Account, type AccountProps } from 'unicove-components';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	interface Props extends Omit<AccountProps, 'href'> {
		contract?: boolean;
	}

	let { contract = false, ...props }: Props = $props();

	let { network } = getContext<UnicoveContext>('state');

	const href = $derived(
		contract ? `/${network}/contract/${props.name}` : `/${network}/account/${props.name}`
	);
</script>

<Account {...props} {href} />
