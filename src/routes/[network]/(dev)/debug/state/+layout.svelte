<script lang="ts">
	import { page } from '$app/stores';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';

	let { children, data } = $props();

	const activeItem = $derived($page.url.pathname.split('/').pop());
</script>

<AccountNavigation
	options={[
		{
			active: activeItem === 'account',
			href: `/${data.network}/debug/state/account`,
			text: 'Account'
		},
		{
			active: activeItem === 'config',
			href: `/${data.network}/debug/state/config`,
			text: 'Config'
		},
		{
			active: activeItem === 'contracts',
			href: `/${data.network}/debug/state/contracts`,
			text: 'Contracts'
		},
		{
			active: activeItem === 'market',
			href: `/${data.network}/debug/state/market`,
			text: 'Market'
		},
		{
			active: activeItem === 'network',
			href: `/${data.network}/debug/state/network`,
			text: 'Network'
		},
		{ active: activeItem === 'wharf', href: `/${data.network}/debug/state/wharf`, text: 'Wharf' }
	]}
/>

<div class="mt-8">
	{@render children()}
</div>
