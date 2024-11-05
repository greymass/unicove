<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import TextInput from './text.svelte';
	import Code from '../code.svelte';

	interface NumberInputProps extends Omit<HTMLInputAttributes, 'type' | 'value'> {
		ref?: HTMLInputElement;
		value?: number;
		unit?: string;
		min?: number;
		max?: number;
		debug?: boolean;
	}

	let {
		ref = $bindable(),
		value: _value = $bindable(),
		unit = '',
		debug = false,
		...props
	}: NumberInputProps = $props();

	let inputValue = $state(String(_value ?? ''));

	export function set(value?: number) {
		inputValue = String(value || '');
	}

	let satisfiesMinimum = $derived(inputValue && (!props.min || Number(inputValue) >= props.min));
	let satisfiesMaxmimum = $derived(inputValue && (!props.max || Number(inputValue) <= props.max));
	let satisfies = $derived(satisfiesMinimum && satisfiesMaxmimum);

	$effect(() => {
		if (inputValue && satisfies) {
			_value = Number(inputValue);
		} else {
			_value = undefined;
		}
	});
</script>

{#if unit}
	<div class="relative">
		<TextInput bind:ref bind:value={inputValue} placeholder="0" inputmode="numeric" {...props} />

		<span
			class="
			pointer-events-none
			absolute
			inset-y-0
			right-0
			flex
			items-center
			pr-4
			text-gray-500"
		>
			{unit}
		</span>
	</div>
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
