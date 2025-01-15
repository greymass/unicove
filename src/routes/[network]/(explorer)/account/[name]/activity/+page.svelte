<script lang="ts">
	import Code from '$lib/components/code.svelte';
	import Transaction from '$lib/components/elements/transaction.svelte';
	import Button from '$lib/components/button/button.svelte';
	import Contract from '$lib/components/elements/contract.svelte';
	import * as m from '$lib/paraglide/messages';

	const { data } = $props();
</script>

<svelte:head>
	<link
		rel="prefetch"
		href={`/${data.network}/api/account/${data.account}/activity/${-data.json.activity.last}`}
	/>
</svelte:head>

{#if data.json.activity.actions.length}
	<div class="grid gap-6 md:grid-cols-[auto_auto_auto_1fr]">
		<div
			class="col-span-full grid grid-cols-subgrid gap-2 border-b border-mineShaft-900 pb-6 md:gap-4"
		>
			<p>ID</p>
			<p>Time</p>
			<p>Action</p>
			<p>Info</p>
		</div>
		{#each data.json.activity.actions as action}
			<div
				class="col-span-full grid grid-cols-subgrid gap-2 border-b border-mineShaft-900 pb-6 md:gap-4"
			>
				<Transaction id={action.id} />
				<p>{action.timestamp}</p>
				<div class="flex gap-2">
					<Contract name={action.contract} />
					<p>{action.action}</p>
				</div>
				<Code>{JSON.stringify(action.data, null, 2)}</Code>
			</div>
		{/each}
	</div>
{/if}

{#if data.json.activity.last}
	<Button href="?start={data.json.activity.last}">{m.common_next()}</Button>
{/if}
