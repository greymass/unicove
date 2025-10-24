<script lang="ts">
	import { Code } from 'unicove-components';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();
</script>

<Code>
	{JSON.stringify(data.account, null, 2)}
</Code>
