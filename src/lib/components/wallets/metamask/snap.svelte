<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import { Stack } from '$lib/components/layout';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		connect: () => Promise<void>;
		networkName: string;
		productName: string;
	}

	let { connect, networkName, productName }: Props = $props();
</script>

<h2 class="text-xl font-semibold">
	{m.metamask_install_add_to_metamask({
		name: productName
	})}
</h2>
<Stack class="mb-1 gap-2">
	<p class="leading-snug">{m.metamask_install_add_p1()}</p>
	<p class="leading-snug">
		{m.metamask_install_add_p2({
			name: productName,
			network: networkName
		})}
	</p>
</Stack>
<Button onclick={connect}
	>{m.homepage_metamask_wallet_install({
		name: productName
	})}</Button
>
