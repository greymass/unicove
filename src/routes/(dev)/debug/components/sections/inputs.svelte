<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import TextInput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';

	import { Asset, Name } from '@wharfkit/antelope';
	import AssetInput from '$lib/components/input/asset.svelte';

	import NameInput from '$lib/components/input/name.svelte';

	let input: AssetInput;

	let assetValue = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);

	let nameValue = $state(Name.from(''));
	let nameErrors: string[] = $state([]);
</script>

<Stack id="inputs" class="gap-8">
	<Stack>
		<h2 class="h2">Text Input</h2>
		<div>
			<h3 class="h3">Default</h3>
			<TextInput placeholder="Placeholder text" />
		</div>
		<Stack>
			<h3 class="h3">With Label</h3>
			<fieldset class="grid items-start gap-3">
				<Label for="labeled-input">Enter a value</Label>
				<TextInput id="labeled-input" placeholder="Placeholder text" value="" />
			</fieldset>
		</Stack>
	</Stack>

	<Stack class="items-start">
		<h2 class="h2">Asset Input</h2>
		<Label for="assetInput">Enter token value:</Label>
		<AssetInput
			id="assetInput"
			bind:this={input}
			bind:value={assetValue}
			bind:valid
			bind:min
			bind:max
			debug
		/>
	</Stack>

	<Stack class="items-start">
		<h2 class="h2">Name Input</h2>
		<!-- <Label for="assetInput">Enter token value:</Label> -->
		<NameInput id="name-input" bind:value={nameValue} bind:errors={nameErrors} debug />
		<p>Name is: {nameValue}</p>
		<ul>
			{#each nameErrors as error}
				<li>{error}</li>
			{/each}
		</ul>
	</Stack>
</Stack>
