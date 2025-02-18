<script lang="ts">
	import Action from '$lib/components/elements/action.svelte';
	import * as m from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<h3 class="h3">
	{m.transaction_num_actions({
		number: data.transaction.actions.length
	})}
</h3>

{#each data.transaction.actions as action}
	<Action {action} />
{/each}
