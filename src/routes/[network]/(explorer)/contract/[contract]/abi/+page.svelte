<script lang="ts">
	import { Code } from 'unicove-components';
	import { Stack } from 'unicove-components';

	const { data } = $props();
</script>

<Stack>
	<Code>{JSON.stringify(data.abi, null, 2)}</Code>
</Stack>
