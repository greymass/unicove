<script lang="ts">
	import { cn } from '$lib/utils/style';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import {Code} from 'unicove-components';

	interface DatetimeInputProps extends HTMLInputAttributes {
		date?: Date;
		value?: string;
		min?: string;
		children?: Snippet;
		debug?: boolean;
	}

	var now = new Date();
	now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

	function dateToInputString(date: Date) {
		return date.toISOString().slice(0, 16);
	}

	let {
		date = $bindable(),
		value = $bindable(),
		min = dateToInputString(now),
		class: className,
		debug = false,
		...props
	}: DatetimeInputProps = $props();

	value = undefined;
	if (date) {
		const utc = new Date(date);
		utc.setMinutes(utc.getMinutes() - utc.getTimezoneOffset());
		value = dateToInputString(utc);
	}

	/** Set the input value from a parent */
	export function set(date: Date | undefined) {
		if (!date) {
			value = undefined;
		} else {
			value = dateToInputString(date);
		}
	}

	$effect(() => {
		if (value) {
			date = new Date(`${value}:00.000`);
		} else {
			date = undefined;
		}
	});
</script>

<div
	class={cn(
		'border-outline focus-within:border-primary focus-within:ring-primary relative flex h-12 gap-2 rounded-lg border-2 px-4 *:content-center focus-within:ring-1 focus-within:ring-3 focus-within:ring-inset',
		className
	)}
>
	<input
		class="placeholder:text-muted w-full rounded-lg bg-transparent font-medium focus:outline-hidden"
		type="datetime-local"
		{min}
		bind:value
		{...props}
	/>
	<div class="text-muted select-none">
		{@render props.children?.()}
	</div>
</div>

{#if debug}
	<div class="mt-4">
		<h3>Component State</h3>
		<!-- prettier-ignore -->
		<Code>
date: {date}
value: {value}
min: {min}
		</Code>
	</div>
{/if}
