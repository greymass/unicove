<script lang="ts">
	import { Asset } from '@wharfkit/antelope';
	import AssetInput from '$lib/components/input/asset.svelte';
	import Button from '$lib/components/button/button.svelte';
	import TextInput from '$lib/components/input/textinput.svelte';
	import Label from '$lib/components/input/label.svelte';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);
</script>

<main class='space-y-12 mt-8'>
	<article>
		<h2 class='h2'>Typography</h2>
		<h1 class='h1'>Heading 1</h1>
		<h2 class='h2'>Heading 2</h2>
		<h3 class='h3'>Heading 3</h3>
		<h4 class='h4'>Heading 4</h4>
		<h5 class='h5'>Heading 5</h5>
		<p class='caption'>Caption</p>
		<p>Paragraph - 
			lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</article>

	<div>
		<h2 class='h2'>Buttons</h2>
		<Button variant="primary" onclick={() => input.set(Asset.from('0.0000 EOS'))}> EOS (0) </Button>
		<Button variant="secondary" onclick={() => input.set(Asset.from('1.0000 EOS'))}> EOS (1) </Button>
		<Button variant="pill" onclick={() => input.set(Asset.from('2100000000.0000 EOS'))}> EOS (MAX) </Button>
	</div>

	<div class='space-y-4'>
		<h2 class='h2'>Text Input</h2>
		<div>
			<h3 class='h4'>Default</h3>
			<TextInput placeholder="Placeholder text" />
		</div>
		<div>
			<h3 class='h4'>With Label</h3>
			<fieldset class='grid gap-3'>
				<Label>Enter a value</Label>
				<TextInput placeholder="Placeholder text" />
			</fieldset>
		</div>
	</div>

	<div>
		<h2 class='h2'>Asset Input</h2>
		<Label for='assetInput'> Enter token value: </Label>
		<AssetInput id='assetInput' bind:this={input} bind:value bind:valid bind:min bind:max />
	</div>
</main>
