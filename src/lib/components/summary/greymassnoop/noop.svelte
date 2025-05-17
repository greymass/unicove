<script lang="ts">
	import AccountElement from '$lib/components/elements/account.svelte';
	import * as m from '$lib/paraglide/messages';

	const { authorization } = $props();
</script>

{#if authorization}
	<AccountElement name={authorization[0].actor} />
	provided the network resources for this transaction.
{:else}
	{m.common_resources_provided_3rd_party()}
{/if}
