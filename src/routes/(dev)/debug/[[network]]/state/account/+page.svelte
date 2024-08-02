<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import { getAccount } from '$lib/state/client/account.svelte';

	import StateNavigation from '../navigation.svelte';

	const account = getAccount();
</script>

<StateNavigation />

<div class="p-8 space-y-4">
	<h2 class="h2">Account State</h2>
	<p>The account state for the currently active session.</p>
	{#if account.name}
		<Button onclick={() => account.refresh()}>Update account state</Button>
		<Code>
			{JSON.stringify(account, null, 2)}
		</Code>
	{:else}
		<p>No account state available.</p>
	{/if}
</div>
