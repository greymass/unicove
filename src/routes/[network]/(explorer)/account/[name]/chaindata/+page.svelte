<script lang="ts">
	import { Code } from 'unicove-components';

	const { data } = $props();
</script>

<Code>{JSON.stringify(data.account, null, 2)}</Code>
