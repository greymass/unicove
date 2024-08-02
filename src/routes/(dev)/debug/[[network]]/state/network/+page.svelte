<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';
	import Code from '$lib/components/code.svelte';
	import StateNavigation from '../navigation.svelte';
	import { page } from '$app/stores';
	import { chainMapper } from '$lib/wharf/chains';

	const { data } = $props();
	const { network } = $derived(data);

	const shortName = $derived(chainMapper.toShortName(String(network?.chain.id)));
	const apiPath = $derived(`${$page.url.protocol}//${$page.url.host}/api/${shortName}/network`);
</script>

<StateNavigation />

<div class="p-8 space-y-4">
	<h2 class="h2">Network State</h2>
	<p>The currently loaded network state, based off the page URL you're on.</p>
	<AccountNavigation
		options={[
			{ active: shortName === 'eos', href: '/debug/state/network', text: 'Default (EOS)' },
			{ active: shortName === 'jungle4', href: '/debug/jungle4/state/network', text: 'Jungle4' },
			{ active: shortName === 'telos', href: '/debug/telos/state/network', text: 'Telos' }
		]}
	/>
	<table>
		<tbody>
			<tr>
				<td>URL</td>
				<td>{$page.url}</td>
			</tr>
			<tr>
				<td>API</td>
				<td>
					<a href={apiPath} target="_blank">{apiPath}</a>
				</td>
			</tr>
			<tr>
				<td>Network</td>
				<td>{network?.chain.name}</td>
			</tr>
			<tr>
				<td>Last Updated</td>
				<td>{network?.last_update}</td>
			</tr>
		</tbody>
	</table>

	<Button onclick={() => network.refresh()}>Update network state</Button>
	<Code>
		{JSON.stringify(network, null, 2)}
	</Code>
</div>
