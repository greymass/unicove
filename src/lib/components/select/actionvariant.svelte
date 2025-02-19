<script lang="ts">
	import type { ActionDisplayVariants } from '$lib/types';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { getContext } from 'svelte';

	const context = getContext<UnicoveContext>('state');

	let current = $derived(context.settings.data.actionDisplayVariant);

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant: ActionDisplayVariants;
	}

	function set(variant: ActionDisplayVariants) {
		context.settings.data.actionDisplayVariant = variant;
	}
</script>

<div class="flex gap-2">
	<Button variant={current !== 'summary' ? 'secondary' : 'primary'} onclick={() => set('summary')}>
		Summary
	</Button>
	<Button variant={current !== 'pretty' ? 'secondary' : 'primary'} onclick={() => set('pretty')}>
		Pretty Print
	</Button>
	<Button variant={current !== 'decoded' ? 'secondary' : 'primary'} onclick={() => set('decoded')}>
		Decoded
	</Button>
	<Button variant={current !== 'json' ? 'secondary' : 'primary'} onclick={() => set('json')}>
		JSON
	</Button>
</div>
