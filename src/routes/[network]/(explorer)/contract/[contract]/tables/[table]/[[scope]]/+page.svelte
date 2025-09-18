<script lang="ts">
	import { Card, Cluster, Stack, Table, TD, TH, TR } from 'unicove-components';
	import ContractTable from '$lib/components/contract/table.svelte';
	import { Code } from 'unicove-components';
	import { Button } from 'unicove-components';
	import { TextInput } from 'unicove-components';
	import { goto } from '$lib/utils';
	import { Checkbox } from 'unicove-components';
	import { Label } from 'unicove-components';

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

	async function query(e: SubmitEvent | MouseEvent) {
		e.preventDefault();
		goto(pageUrl, {
			keepFocus: true
		});
	}
</script>

<Stack>
	<Stack>
		<Stack class="gap-2">
			<h2 class="text-headline">Table Browser</h2>
			<Cluster>
				{#if scope}
					<span>
						Scope: {scope}
					</span>
				{/if}
				{#if lower}
					<span>
						Lower: {lower}
					</span>
				{/if}
				{#if upper}
					<span>
						Upper: {upper}
					</span>
				{/if}
				{#if reverse}
					<span>
						Reverse: {reverse}
					</span>
				{/if}
			</Cluster>
		</Stack>

		<Card class="bg-surface-container-high overflow-x-auto rounded-b-lg md:rounded-r-lg">
			<Stack>
				<form onsubmit={query}>
					<Cluster class="items-end">
						<TextInput label="Scope" placeholder="Scope" bind:value={scope} />
						<TextInput label="Lower" name="lower" placeholder="Lower bound" bind:value={lower} />
						<TextInput label="Upper" name="upper" placeholder="Upper bound" bind:value={upper} />

						<fieldset class="flex h-12 items-center gap-3">
							<Checkbox id="reverse" bind:checked={reverse} />
							<Label for="reverse">Reverse?</Label>
						</fieldset>

						<Button onclick={query}>Query</Button>
					</Cluster>
				</form>

				<Table full>
					{#snippet thead()}
						{#if struct}
							{#each struct.fields as field}
								<TH>{field.name}</TH>
							{/each}
						{/if}
					{/snippet}

					{#each rows as row}
						<TR>
							{#each Object.keys(row) as key}
								<TD>
									<Code>
										{JSON.stringify(row[key], null, 2)}
									</Code>
								</TD>
							{/each}
						</TR>
					{/each}
				</Table>
			</Stack>
		</Card>

		{#if data.next}
			<div class="flex gap-4">
				<Button onclick={first} variant="secondary">First Page</Button>
				<Button onclick={more}>Next Page</Button>
			</div>
		{/if}
	</Stack>

	{#if table}
		<ContractTable abi={data.abi} contract={data.contract} {table} />
	{/if}
</Stack>
