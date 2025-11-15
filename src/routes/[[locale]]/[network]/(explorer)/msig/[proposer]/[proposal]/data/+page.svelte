<script lang="ts">
	import { Code } from 'unicove-components';

	let props = $props();
</script>

<Code>
	{JSON.stringify(props.data.proposal, null, 2)}
</Code>
