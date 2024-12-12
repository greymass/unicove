<script lang="ts">
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { PrivateKey, PublicKey } from '@wharfkit/antelope';
	import { KeyRound } from 'lucide-svelte';
	import { getContext } from 'svelte';

	const { network } = getContext<UnicoveContext>('state');

	interface Props {
		key?: PublicKey | PrivateKey | string;
		icon?: boolean;
	}

	let { key, icon }: Props = $props();
</script>

{#if key}
	<a
		class="inline-flex items-center gap-2 text-skyBlue-500 hover:text-skyBlue-400"
		href="/{network}/key/{String(key)}"
	>
		{#if icon}
			<KeyRound class="size-4" />
		{/if}
		<span class="truncate">
			{String(key)}
		</span>
	</a>
{/if}
