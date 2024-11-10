<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import TextInput from './text.svelte';

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
		const inputString = String(event.currentTarget.value);

		const numericInput = Number(inputString);

		if (isNaN(numericInput) || numericInput < 0) {
			valid = false;
			return;
		}

		isAddingDecimal = false;
		valueSetByParent = false;

		// Allowing input of decimal values
		if (numericInput && String(numericInput) !== inputString) {
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

<div class="relative">
	<TextInput
		bind:ref
		bind:value={input}
		placeholder="0 {unit}"
		inputmode="numeric"
		{autofocus}
		onblur={handleBlur}
		oninput={handleInput}
		{...props}
	/>
	<div
		onclick={cycleUnit}
		onkeydown={cycleUnit}
		role="button"
		tabindex="0"
		class="absolute right-2 top-1/2 flex w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-transparent py-2 text-skyBlue-500 transition-all duration-200 ease-in-out hover:text-sky-300"
	>
		<span class="text-sm font-medium">{unit}</span>
		<span class="ml-1 text-xs">⇅</span>
	</div>
</div>

{#if debug}
	<div class="mt-4">
		<h3>Component State</h3>
		<pre>
            Input (string):   "{input}"
            Bytes (number):   "{value}"
            Unit: "{unit}"
            Valid: {valid}
		</pre>
	</div>
{/if}
