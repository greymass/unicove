<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import Code from '$lib/components/code.svelte';

	const { data } = $props();
</script>

{#if data.account}
	<div class="space-y-4">
		<h3 class="h3">Permissions</h3>
		<Code>{JSON.stringify(data.account.permissions, null, 2)}</Code>
	</div>
{/if}
