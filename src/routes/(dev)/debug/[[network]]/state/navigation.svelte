<script lang="ts">
	import { page } from '$app/stores';
	import AccountNavigation from '$lib/components/navigation/accountnavigation.svelte';

	const activeItem = $derived($page.url.pathname.split('/').pop());
</script>

<AccountNavigation
	options={[
		{ active: activeItem === 'account', href: '/debug/state/account', text: 'Account' },
		{ active: activeItem === 'network', href: '/debug/state/network', text: 'Network' },
		{ active: activeItem === 'wharf', href: '/debug/state/wharf', text: 'Wharf' }
	]}
/>
