<script lang="ts">
	import { Cluster, Stack } from 'unicove-components';
	import { TextInput } from 'unicove-components';
	import Label from '$lib/components/input/label.svelte';
	import AssetOrUnitsInput from '$lib/components/input/assetOrUnits.svelte';
	import { NumberInput } from 'unicove-components';
	import Switch from '$lib/components/input/switch.svelte';
	import Checkbox from '$lib/components/input/checkbox.svelte';
	import { BytesInput } from 'unicove-components';

	import { Asset } from '@wharfkit/antelope';
	import { AssetInput } from 'unicove-components';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 TOKEN'));
	let valid = $state(false);
	let unitsValue = $state(0);
	let format: 'asset' | 'units' = $state('asset');

	let min = $state(1);
	let max = $state(100);

	let numberValue: number | undefined = $state(undefined);
	let controlledSwitch = $state(true);

	let bytesValue = $state(0);
</script>

<Stack id="inputs">
	<Stack>
		<h2 class="h2">Text Input</h2>
		<Stack>
			<h3 class="h3">Default</h3>
			<TextInput placeholder="Placeholder text" />
		</Stack>
		<Stack>
			<h3 class="h3">With Label</h3>
			<fieldset class="grid gap-3">
				<Label for="labeled-input">Enter a value</Label>
				<TextInput id="labeled-input" placeholder="Placeholder text" value="" />
			</fieldset>
		</Stack>
	</Stack>

	<Stack>
		<h2 class="h2">Asset Input</h2>
		<Label for="assetInput">Enter token value:</Label>
		<AssetInput id="assetInput" bind:this={input} bind:value bind:valid bind:min bind:max debug />
	</Stack>

	<Stack>
		<h2 class="h2">Asset or Units Input</h2>
		<AssetOrUnitsInput bind:assetValue={value} bind:unitsValue bind:format unitName="Units" debug />
	</Stack>

	<Stack>
		<h2 class="h2">Number Input</h2>
		<NumberInput id="numberInput" bind:value={numberValue} min={0} max={100} step={1} debug />
	</Stack>

	<Stack>
		<h2 class="h2">Number Input With Unit</h2>
		<NumberInput
			id="numberInput"
			unit="kb"
			bind:value={numberValue}
			min={0}
			max={100}
			step={1}
			debug
		/>
	</Stack>

	<Stack>
		<h2 class="h2">Bytes Input</h2>
		<BytesInput id="bytesInput" bind:value={bytesValue} debug />
	</Stack>

	<form>
		<Stack>
			<h2 class="h2">Switch</h2>

			<Stack>
				<h3 class="h4">Default</h3>
				<Cluster>
					<Switch id="mySwitch-1" name="mySwitch-1" checked={false} />
					<Switch id="mySwitch-1" name="mySwitch-1" checked={true} />
				</Cluster>
			</Stack>

			<Stack>
				<h3 class="h4">Disabled</h3>
				<Cluster>
					<Switch id="mySwitch-2" name="mySwitch-2" disabled checked={false} />
					<Switch id="mySwitch-2" name="mySwitch-2" disabled checked />
				</Cluster>
			</Stack>

			<Stack>
				<h3 class="h4">Controlled</h3>
				<Switch id="mySwitch-3" name="mySwitch-3" bind:checked={controlledSwitch} />
				<p>Switch is {controlledSwitch ? 'on' : 'off'}</p>
			</Stack>
		</Stack>

		<Stack class="mt-5">
			<h2 class="h2">Checkbox</h2>
			<Stack>
				<Label for="myCheckbox-1">Default</Label>
				<Checkbox id="myCheckbox-1" name="myCheckbox-1" checked={false} />
			</Stack>

			<Stack>
				<Label for="myCheckbox-2">Disabled</Label>
				<Checkbox id="myCheckbox-2" name="myCheckbox-2" disabled checked />
			</Stack>

			<Stack>
				<Label for="myCheckbox-ind">Indeterminate</Label>
				<Checkbox id="myCheckbox-ind" name="myCheckbox-ind" checked="indeterminate" />
			</Stack>

			<Stack>
				<Label for="myCheckbox-3">Checked</Label>
				<Checkbox id="myCheckbox-3" name="myCheckbox-3" bind:checked={controlledSwitch} />
				<p>Checkbox is {controlledSwitch ? 'checked' : 'empty'}</p>
			</Stack>
		</Stack>
	</form>
</Stack>
