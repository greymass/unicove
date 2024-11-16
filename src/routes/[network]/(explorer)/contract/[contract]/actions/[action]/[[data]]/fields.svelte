<script lang="ts">
	import Self from './fields.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import Label from '$lib/components/input/label.svelte';
	import Textinput from '$lib/components/input/text.svelte';
	import type { ABI } from '@wharfkit/antelope';

	interface PageProps {
		abi: ABI;
		codePath?: string[];
		fields: ABI.Field[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		state?: Record<string, any>;
	}
	const { abi, codePath = [], fields, state = $bindable({}) }: PageProps = $props();

	function deriveFields(fieldType: string) {
		const struct = abi.structs.find((s: ABI.Struct) => s.name === fieldType);
		if (struct) {
			return struct.fields;
		}
		return [];
	}
</script>

<div class="mt-4 space-y-4">
	{#each fields as field}
		{@const subfields = deriveFields(field.type)}
		{#if subfields.length > 0}
			<Self {abi} codePath={[...codePath, field.name]} fields={subfields} {state} />
		{:else}
			{@const fieldName = [...codePath, field.name].join('->')}
			<fieldset class="grid gap-2">
				<Label for="{fieldName}-input">
					{fieldName} ({field.type})
				</Label>
				{#if field.type === 'bool'}
					<Checkbox bind:checked={state[fieldName]} id="{fieldName}-input" />
				{:else}
					<Textinput
						bind:value={state[fieldName]}
						placeholder={field.name}
						id="{fieldName}-input"
					/>
				{/if}
			</fieldset>
		{/if}
	{/each}
</div>
