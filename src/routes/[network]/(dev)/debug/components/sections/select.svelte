<script>
	import { Cluster, Stack } from '$lib/components/layout';
	import Select from '$lib/components/select/select.svelte';
	import Label from '$lib/components/input/label.svelte';
	import { Chains } from '@wharfkit/common';
	import TokenSelect from '$lib/components/select/token.svelte';

	const options = [
		{ value: 30, label: '30d' },
		{ value: 60, label: '60d' },
		{ value: 90, label: '90d' },
		{ value: 365, label: '365d' }
	];
	let selected = $state(options[1]);

	const formOptions = [
		{ value: 30, label: '30d' },
		{ value: 60, label: '60d' },
		{ value: 90, label: '90d' },
		{ value: 365, label: '365d' }
	];
	let selectedFormOption = $state(formOptions[1]);

	const imageOptions = [
		{ value: Chains.EOS.id, label: Chains.EOS.name, image: String(Chains.EOS.getLogo()) },
		{
			value: Chains.Jungle4.id,
			label: Chains.Jungle4.name,
			image: String(Chains.Jungle4.getLogo())
		},
		{ value: Chains.FIO.id, label: Chains.FIO.name, image: String(Chains.FIO.getLogo()) },
		{ value: Chains.Telos.id, label: Chains.Telos.name, image: String(Chains.Telos.getLogo()) },
		{ value: Chains.WAX.id, label: Chains.WAX.name, image: String(Chains.WAX.getLogo()) },
		{ value: Chains.Proton.id, label: Chains.Proton.name, image: String(Chains.Proton.getLogo()) }
	];
	let imageOptionSelected = $state(imageOptions[0]);

	const tokenOptions = [
		Chains.EOS,
		Chains.Jungle4,
		Chains.FIO,
		Chains.Telos,
		Chains.WAX,
		Chains.Proton
	];
	let tokenSelected = $state(tokenOptions[0]);
</script>

<Stack id="select">
	<h2 class="h2">Select</h2>

	<Stack class="items-start">
		<h3 class="h3">Pill Select</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="date-range">Select a date range</Label>
				<Select id="date-range" {options} bind:selected />
			</Stack>
			<span>Value in parent: {selected.label}</span>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Form Select</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="form-select">Select a form option</Label>
				<Select
					variant="form"
					id="form-select"
					options={formOptions}
					bind:selected={selectedFormOption}
				/>
			</Stack>
			<span>Value in parent: {selectedFormOption.label}</span>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Form Select with Images</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="image-select">Select an option</Label>
				<Select
					variant="form"
					id="image-select"
					options={imageOptions}
					bind:selected={imageOptionSelected}
					sameWidth={false}
				/>
			</Stack>
			<span>Value in parent: {imageOptionSelected.label}</span>
		</Cluster>
	</Stack>

	<Stack class="items-start">
		<h3 class="h3">Token Select</h3>
		<Cluster class="items-end">
			<Stack class="gap-2">
				<Label for="token-select">Select a token</Label>
				<TokenSelect id="token-select" options={tokenOptions} bind:selected={tokenSelected} />
			</Stack>
			<span>Value in parent: {tokenSelected.name}</span>
		</Cluster>
	</Stack>
</Stack>
