<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { isSearchAccount } from '$lib/state/search/validators';

	interface Props {
		block?: number;
		account?: string;
		label?: string;
		class?: string;
	}

	const { block, account, label, class: className = '' }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const href = $derived.by(() => {
		if (block !== undefined) return context.urlPath(`/${context.network}/block/${block}`);
		if (account !== undefined && isSearchAccount(account)) {
			return context.urlPath(`/${context.network}/account/${account}`);
		}
		return null;
	});
	const text = $derived(label ?? (block !== undefined ? String(block) : (account ?? '')));
</script>

{#if href}
	<a {href} class="text-primary hover:text-primary-hover {className}">{text}</a>
{:else}
	<span class={className}>{text}</span>
{/if}
