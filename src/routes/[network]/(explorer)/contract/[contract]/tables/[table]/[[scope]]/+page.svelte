<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	import Stack from '$lib/components/layout/stack.svelte';
	import Table from '$lib/components/contract/table.svelte';
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TextInput from '$lib/components/input/text.svelte';
	import { PUBLIC_CANONICAL_ORIGIN } from '$env/static/public';
	import { goto } from '$app/navigation';

	const { data } = $props();

	const table = data.abi.tables.find((t) => t.name === data.table);
	const struct = data.abi.structs.find((s) => s.name === table.type);

	let rows = $derived(data.rows);
	let scope = $state(data.scope || data.contract);
	let next = $state(data.next);
	let lower = $state(data.lower);
	let upper = $state(data.upper);

	// onMount(() => {
	// 	rows = data.rows;
	// });

	let pageUrl = $derived.by(() => {
		let url = `${PUBLIC_CANONICAL_ORIGIN}/${data.network}/contract/${data.contract}/tables/${data.table}`;
		if (scope) {
			url += `/${scope}`;
		}
		if (lower || upper) {
			url += `?`;
			if (lower) {
				url += `lower=${lower}`;
			}
			if (upper) {
				url += `&upper=${upper}`;
			}
		}
		return url;
	});

	let firstUrl = $derived(
		`/${data.network}/contract/${data.contract}/tables/${data.table}/${scope}`
	);

	let nextUrl = $derived(
		`/${data.network}/contract/${data.contract}/tables/${data.table}/${scope}?lower=${data.next}`
	);

	async function more() {
		goto(nextUrl, {
			noScroll: true
		});
	}

	async function first() {
		goto(firstUrl, {
			noScroll: true
		});
	}

	async function query(e: SubmitEvent) {
		e.preventDefault();
		goto(pageUrl, {
			keepFocus: true
		});
	}
</script>

<Stack>
	<div>
		<div class="rounded-t-lg bg-mineShaft-950 px-4 py-3 md:rounded-l-lg">
			<h2 class="h2 pb-6">Table Browser</h2>
			{#if data.scope}
				Scope: {data.scope}
			{/if}
			{#if data.lower}
				Lower: {data.lower}
			{/if}
			{#if data.upper}
				Upper: {data.upper}
			{/if}
		</div>

		<div class="overflow-x-auto rounded-b-lg bg-mineShaft-950/50 px-4 py-3 md:rounded-r-lg">
			<form onsubmit={query}>
				<div class="flex gap-2">
					<TextInput placeholder="Scope" bind:value={scope} />
					<TextInput name="lower" placeholder="Lower bound" bind:value={lower} />
					<TextInput name="upper" placeholder="Upper bound" bind:value={upper} />
					<Button>Query</Button>
				</div>
			</form>
			<table class="table-styles">
				<thead>
					<tr>
						{#each struct?.fields as field}
							<th> {field.name} </th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row}
						<tr>
							{#each Object.keys(row) as key}
								<td class="align-top">
									<Code>
										{JSON.stringify(row[key], null, 2)}
									</Code>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if data.next}
			<div class="flex gap-2">
				<Button onclick={first} variant="secondary">First Page</Button>
				<Button onclick={more}>Next Page</Button>
			</div>
		{/if}
	</div>

	<Table abi={data.abi} contract={data.contract} network={data.network} {table} />
</Stack>
