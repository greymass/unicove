<script lang="ts">
	import { Stack } from '$lib/components/layout';
	import TextInput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';

	import { Asset } from '@wharfkit/antelope';
	import AssetInput from '$lib/components/input/asset.svelte';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);
</script>

<Stack id="inputs">
	<Stack>
		<h2 class="h2">Text Input</h2>
		<div>
			<h3 class="h3">Default</h3>
			<TextInput placeholder="Placeholder text" />
		</div>
		<div>
			<h3 class="h3">With Label</h3>
			<fieldset class="grid gap-3">
				<Label for="labeled-input">Enter a value</Label>
				<TextInput id="labeled-input" placeholder="Placeholder text" value="" />
			</fieldset>
		</div>
	</Stack>

	<div>
		<h2 class="h2">Asset Input</h2>
		<Label for="assetInput">Enter token value:</Label>
		<AssetInput id="assetInput" bind:this={input} bind:value bind:valid bind:min bind:max debug />
	</div>
</Stack>
