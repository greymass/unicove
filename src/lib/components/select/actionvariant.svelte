<script lang="ts">
	import { getContext } from 'svelte';
	import type { ActionDisplayVariants } from '$lib/types';
	import Button from '$lib/components/button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');

	let current = $derived(context.settings.data.actionDisplayVariant);

	function set(variant: ActionDisplayVariants) {
		context.settings.data.actionDisplayVariant = variant;
	}
</script>

{#if context.settings.data.debugMode}
	<div class="flex gap-2">
		<Button
			variant={current !== 'summary' ? 'secondary' : 'primary'}
			onclick={() => set('summary')}
		>
			Summary
		</Button>
		<Button
			variant={current !== 'ricardian' ? 'secondary' : 'primary'}
			onclick={() => set('ricardian')}
		>
			Ricardian
		</Button>
		<Button variant={current !== 'pretty' ? 'secondary' : 'primary'} onclick={() => set('pretty')}>
			Pretty Print
		</Button>
		<Button
			variant={current !== 'decoded' ? 'secondary' : 'primary'}
			onclick={() => set('decoded')}
		>
			Decoded
		</Button>
		<Button variant={current !== 'json' ? 'secondary' : 'primary'} onclick={() => set('json')}>
			JSON
		</Button>
	</div>
{/if}
