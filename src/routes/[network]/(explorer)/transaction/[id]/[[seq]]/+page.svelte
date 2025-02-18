<script lang="ts">
	import Button from '$lib/components/button/button.svelte';
	import Action from '$lib/components/elements/action.svelte';
	import Trace from '$lib/components/elements/trace.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionDisplayVariants } from '$lib/types.js';

	let { data } = $props();

	let variant: ActionDisplayVariants = $state('pretty');
</script>

Actions ({data.transaction.actions.length})

<div class="flex gap-2">
	<Button onclick={() => (variant = 'json')}>JSON</Button>
	<Button onclick={() => (variant = 'decoded')}>Decoded</Button>
	<Button onclick={() => (variant = 'pretty')}>Pretty</Button>
	<Button onclick={() => (variant = 'ricardian')}>Ricardian</Button>
	<Button onclick={() => (variant = 'summary')}>Summary</Button>
</div>

{#each data.transaction.filtered as trace}
	<Trace {trace} {variant} />
{/each}
