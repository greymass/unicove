<script lang="ts">
	import { Select, type ExtendedSelectOption } from 'unicove-components';

	interface StatusFilterProps {
		value: string;
		onchange: (status: string) => void;
	}

	const { value, onchange }: StatusFilterProps = $props();

	const statusOptions: ExtendedSelectOption[] = [
		{ label: 'All Statuses', value: 'all' },
		{ label: 'Proposed', value: 'proposed' },
		{ label: 'Executed', value: 'executed' },
		{ label: 'Cancelled', value: 'cancelled' },
		{ label: 'Expired', value: 'expired' }
	];

	let selected: ExtendedSelectOption = $state(
		statusOptions.find((o) => o.value === value) || statusOptions[0]
	);

	function handleChange({ next }: { next: ExtendedSelectOption | undefined }) {
		if (next) {
			selected = next;
			onchange(String(next.value));
		}
		return next;
	}
</script>

<Select id="status-filter" options={statusOptions} bind:selected onSelectedChange={handleChange} />
