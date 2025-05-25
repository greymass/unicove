<script lang="ts">
	import { getContext } from 'svelte';

	import { requestSnap } from '$lib/metamask-snap';
	import Button from '$lib/components/button/button.svelte';
	import MetaMaskSnap from '$lib/components/wallets/metamask/snap.svelte';
	import type { MetaMaskState } from '$lib/state/metamask.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import MetaMaskInstall from '$lib/components/wallets/metamask/install.svelte';

	const context = getContext<UnicoveContext>('state');

	type States = 'install' | 'snap' | 'children';
	let state: States = $derived(deriveState(context.metamask));

	function deriveState(metamask: MetaMaskState): States {
		if (!metamask.snapsDetected) {
			return 'install';
		} else if (!metamask.isInstalled) {
			return 'snap';
		}
		return 'children';
	}

	interface Props {
		callback: () => void;
	}

	let { callback }: Props = $props();

	const networkName = context.network.chain.name || '';
	const productName = context.network.config.metamask?.name || '';

	async function connect() {
		await requestSnap(context.metamask);
	}
</script>

{#if state === 'install'}
	<div>
		<h2>Install</h2>
		<MetaMaskInstall {networkName} {productName} />
	</div>
{:else if state === 'snap'}
	<div>
		<h2>Snap</h2>
		<MetaMaskSnap {connect} {networkName} {productName} />
	</div>
{:else}
	<div>
		<h2>Ready</h2>
		<Button onclick={callback}>Next</Button>
	</div>
{/if}
