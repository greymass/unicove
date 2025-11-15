<script lang="ts">
	import { Code } from 'unicove-components';

	let { data } = $props();
</script>

<Code>
	{JSON.stringify(data, undefined, 2)}
</Code>
