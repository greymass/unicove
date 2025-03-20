<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import TextInput from './text.svelte';
	import Code from '../code.svelte';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';

	interface BytesInputProps extends ComponentProps<typeof TextInput> {
		valid?: boolean;
		validMinimum?: boolean;
		validMaximum?: boolean;
		value: number | undefined;
		debug?: boolean;
	}

	let {
		autofocus = false,
		ref = $bindable(),
		debug = false,
		value = $bindable(),
		valid = $bindable(),
		oninput,
		onblur,
		...props
	}: BytesInputProps = $props();

	/** The string value bound to the form input */
	let input: string | null = $state(String(value || ''));

	/** The current unit of measurement */
	let unit: 'Bytes' | 'KB' | 'MB' | 'GB' = $state('KB');

	let valueSetByParent = $state(false);

	const UNIT_MULTIPLIERS = {
		Bytes: 1,
		KB: 1000,
		MB: 1000 * 1000,
		GB: 1000 * 1000 * 1000
	};

	let isAddingDecimal = $state(false);
	let previousValue = $state(0);

	$effect(() => {
		if (value === previousValue) {
			return;
		}

		if (value) {
			const newInput = String(value / UNIT_MULTIPLIERS[unit]);
			if (input !== newInput && !isAddingDecimal) {
				input = newInput ? newInput : '';
				previousValue = value;
			}
			valueSetByParent = true;
		} else {
			input = null;
			previousValue = 0;
		}
	});

	/** Set the input value from a parent */
	export function reset() {
		input = null;
		value = undefined;

		oninput?.(
			new InputEvent('input', {}) as InputEvent & {
				currentTarget: EventTarget & HTMLInputElement;
			}
		);
	}

	/** Convert the string into a usable number and update valid state */
	function handleInput(
		event: (Event & { currentTarget: EventTarget & HTMLInputElement }) | null | undefined
	) {
		if (!event) {
			return;
		}
		const inputString = event.currentTarget.value;
		const numericInput = Number(inputString);

		if (isNaN(numericInput) || numericInput < 0) {
			valid = false;
			return;
		}

		isAddingDecimal = false;
		valueSetByParent = false;

		// Allowing input of decimal values
		if (
			numericInput &&
			String(numericInput) !== inputString &&
			String(numericInput) !== `0${inputString}`
		) {
			isAddingDecimal = true;
			input = inputString || '';
			return;
		}

		valid = true;
		const multiplier = UNIT_MULTIPLIERS[unit];

		previousValue = numericInput * multiplier;
		value = previousValue;

		if (event) {
			oninput?.(event);
		}
	}

	function cycleUnit() {
		const units: (keyof typeof UNIT_MULTIPLIERS)[] = Object.keys(
			UNIT_MULTIPLIERS
		) as (keyof typeof UNIT_MULTIPLIERS)[];
		const currentIndex = units.indexOf(unit);
		const newUnit = units[(currentIndex + 1) % units.length];

		if (value !== undefined) {
			const currentMultiplier = UNIT_MULTIPLIERS[unit];
			const newMultiplier = UNIT_MULTIPLIERS[newUnit];
			if (!valueSetByParent) {
				value = (value / currentMultiplier) * newMultiplier;
				previousValue = value || 0;
				oninput?.(
					new InputEvent('input', { data: String(value) }) as InputEvent & {
						currentTarget: EventTarget & HTMLInputElement;
					}
				);
			}
			if (value < 1) {
				return reset();
			}
			const formattedValue = (value / newMultiplier).toFixed(9);
			input = parseFloat(formattedValue) === 0 ? '0' : formattedValue.replace(/\.?0+$/, '');
		}

		unit = newUnit;
	}

	function handleBlur(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		isAddingDecimal = false;
		onblur?.(event);
	}

	if (debug) {
		$inspect({
			input,
			value,
			unit,
			valid
		});
	}
</script>

<TextInput
	bind:ref
	bind:value={input}
	placeholder="0 {unit}"
	step="any"
	inputmode="decimal"
	{autofocus}
	onblur={handleBlur}
	oninput={handleInput}
	{...props}
>
	<button
		onclick={cycleUnit}
		type="button"
		class="flex h-full select-none items-center gap-1 rounded-md bg-transparent text-sky-blue-500 hover:text-sky-blue-300 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-solar-500"
	>
		<span class="text-sm font-medium">{unit}</span>
		<ArrowUpDown class="size-4" />
	</button>
</TextInput>

{#if debug}
	<div class="mt-4">
		<h3>Component State</h3>
		<Code>
			<pre>Input (string):   "{input}"
Bytes (number):   "{value}"
Unit: "{unit}"
Valid: {valid}</pre>
		</Code>
	</div>
{/if}
