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
		...props
	}: BytesInputProps = $props();

	/** The string value bound to the form input */
	let input: string | null = $state(String(value || ''));

	/** The current unit of measurement */
	let unit: 'Bytes' | 'KB' | 'MB' | 'GB' = $state('Bytes');

	const UNIT_MULTIPLIERS = {
		Bytes: 1,
		KB: 1000,
		MB: 1000 * 1000,
		GB: 1000 * 1000 * 1000
	};

	/** Convert the string into a usable number and update valid state */
	$effect(() => {
		const numericInput = Number(input);
		if (isNaN(numericInput) || numericInput < 0) {
			valid = false;
			return;
		}
		valid = true;
		const multiplier = UNIT_MULTIPLIERS[unit];

		value = numericInput * multiplier;
	});

	$effect(() => {
		if (input !== String(value)) {
			input = value ? String(value / UNIT_MULTIPLIERS[unit]) : '';
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

	function cycleUnit() {
		reset();

		const units: (keyof typeof UNIT_MULTIPLIERS)[] = Object.keys(
			UNIT_MULTIPLIERS
		) as (keyof typeof UNIT_MULTIPLIERS)[];
		const currentIndex = units.indexOf(unit);
		unit = units[(currentIndex + 1) % units.length];
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
		inputmode="decimal"
		{autofocus}
		{oninput}
		{...props}
	/>
	<div
		onclick={cycleUnit}
		onkeydown={cycleUnit}
		role="button"
		tabindex="0"
		class="absolute right-2 top-1/2 flex w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border-2 border-gray-500 bg-transparent py-2 transition-all duration-200 ease-in-out hover:border-gray-300"
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
