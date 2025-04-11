<script lang="ts">
	import Stack from '$lib/components/layout/stack.svelte';
	import Table from '$lib/components/contract/table.svelte';
	import Code from '$lib/components/code.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TextInput from '$lib/components/input/text.svelte';
	import { goto } from '$lib/utils';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import Label from '$lib/components/input/label.svelte';

	const { data } = $props();

	const table = data.abi.tables.find((t) => t.name === data.table);
	const struct = table && data.abi.structs.find((s) => s.name === table.type);

	let rows = $derived(data.rows);
	let scope = $state(data.scope || data.contract);
	let lower = $state(data.lower);
	let upper = $state(data.upper);
	let reverse = $state(data.reverse);

	let pageUrl = $derived.by(() => {
		let url = `/${data.network}/contract/${data.contract}/tables/${data.table}`;
		if (scope) {
			url += `/${scope}`;
		}
		if (lower || upper || reverse) {
			url += `?`;
			const parts = [];
			if (lower) {
				parts.push(`lower=${lower}`);
			}
			if (upper) {
				parts.push(`upper=${upper}`);
			}
			if (reverse) {
				parts.push(`reverse=${reverse}`);
			}
			if (parts.length) {
				url += parts.join('&');
			}
		}
		return url;
	});

	let firstUrl = $derived(
		`/${data.network}/contract/${data.contract}/tables/${data.table}/${scope}`
	);

	let nextUrl = $derived(
		`/${data.network}/contract/${data.contract}/tables/${data.table}/${scope}?lower=${data.next}&reverse=${data.reverse}`
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
		<div class="bg-mine-950 rounded-t-lg px-4 py-3 md:rounded-l-lg">
			<h2 class="h2 pb-6">Table Browser</h2>
			{#if scope}
				Scope: {scope}
			{/if}
			{#if lower}
				Lower: {lower}
			{/if}
			{#if upper}
				Upper: {upper}
			{/if}
			{#if reverse}
				Reverse: {reverse}
			{/if}
		</div>

		<div class="bg-mine-950/50 overflow-x-auto rounded-b-lg px-4 py-3 md:rounded-r-lg">
			<form onsubmit={query}>
				<div class="flex gap-2">
					<TextInput placeholder="Scope" bind:value={scope} />
					<TextInput name="lower" placeholder="Lower bound" bind:value={lower} />
					<TextInput name="upper" placeholder="Upper bound" bind:value={upper} />
					<fieldset class="flex items-center gap-3">
						<Checkbox id="reverse" bind:checked={reverse} />
						<Label for="reverse">Reverse?</Label>
					</fieldset>

					<Button>Query</Button>
				</div>
			</form>
			<table class="table-styles">
				<thead>
					<tr>
						{#if struct}
							{#each struct.fields as field}
								<th> {field.name} </th>
							{/each}
						{/if}
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

	{#if table}
		<Table abi={data.abi} contract={data.contract} network={data.network} {table} />
	{/if}
</Stack>
