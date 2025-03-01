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
		class="inline-grid grid-cols-[auto_1fr] items-start gap-2 font-mono text-skyBlue-500 hover:text-skyBlue-400"
		href="/{network}/key/{String(key)}"
	>
		{#if icon}
			<div class="content-center pt-1">
				<KeyRound class="size-4 shrink-0 " />
			</div>
		{/if}
		<span class="break-all">
			{String(key)}
		</span>
	</a>
{/if}
