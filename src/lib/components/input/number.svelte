<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { TextInput } from 'unicove-components';
	import {Code} from 'unicove-components';

	interface NumberInputProps extends Omit<HTMLInputAttributes, 'type' | 'value'> {
		ref?: HTMLInputElement;
		valid?: boolean;
		value?: number;
		unit?: string;
		min?: number;
		max?: number;
		debug?: boolean;
	}

	let {
		ref = $bindable(),
		valid = $bindable(false),
		value: _value = $bindable(),
		unit = '',
		debug = false,
		...props
	}: NumberInputProps = $props();

	let inputValue = $state(String(_value ?? ''));

	export function set(value?: number) {
		inputValue = String(value || '');
	}

	let satisfiesMinimum = $derived(!!inputValue && (!props.min || Number(inputValue) >= props.min));
	let satisfiesMaxmimum = $derived(!!inputValue && (!props.max || Number(inputValue) <= props.max));
	let satisfies = $derived(satisfiesMinimum && satisfiesMaxmimum);

	$effect(() => {
		valid = satisfies;
		if (inputValue && satisfies) {
			_value = Number(inputValue);
		} else {
			_value = undefined;
		}
	});
</script>

{#if unit}
	<TextInput
		bind:ref
		bind:value={inputValue}
		placeholder="0"
		inputmode="decimal"
		step="any"
		{...props}
	>
		{unit}
	</TextInput>
{:else}
	<TextInput bind:ref bind:value={inputValue} placeholder="0" type="number" {...props} />
{/if}

{#if debug}
	<div class="mt-4">
		<h3>Component State</h3>
		<!-- prettier-ignore -->
		<Code>
Input Value: {inputValue}
Parsed Value: {_value}
Satisfies Minimum: {satisfiesMinimum}
Satisfies Maximum: {satisfiesMaxmimum}
Satisfies: {satisfies}
Min: {props.min}
Max: {props.max}
		</Code>
	</div>
{/if}
