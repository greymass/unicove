<script lang="ts">
	import { Stack, Button } from 'unicove-components';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		networkName: string;
		productName: string;
	}

	let { networkName, productName }: Props = $props();
</script>

<h2 class="text-xl font-semibold">
	{m.metamask_install_title({
		name: productName
	})}
</h2>
<Stack class="mb-1 gap-2">
	<p class="leading-snug">
		{m.metamask_install_p1({
			name: productName,
			network: networkName
		})}
	</p>
	<p class="leading-snug">
		{m.metamask_install_p2({
			name: productName
		})}
	</p>
</Stack>
<Button href={'https://metamask.io/download/'} blank>{m.metamask_install_action()}</Button>
<p class="text-xs text-balance">
	{m.metamask_install_action_note()}
</p>
