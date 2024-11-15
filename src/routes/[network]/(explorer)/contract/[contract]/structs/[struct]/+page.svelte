<script lang="ts">
	import type { ABI } from '@wharfkit/antelope';

	import type { PageData } from './$types';
	import Code from '$lib/components/code.svelte';
	import { Stack } from '$lib/components/layout';

	const { data }: { data: PageData } = $props();
	const struct = data.abi.structs.find((s: ABI.Struct) => s.name === data.struct);
</script>

<Stack>
	<Code lang="json">{JSON.stringify(struct, null, 2)}</Code>
</Stack>
