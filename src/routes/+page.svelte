<script>
	import * as m from '$lib/paraglide/messages.js';
	import Button from '$lib/components/button/button.svelte';
	import { Box, Center, Stack } from '$lib/components/layout';
	import { getWharf } from '$lib/state/client/wharf.svelte';
	import { languageTag } from '$lib/paraglide/runtime';
	import { chainShortNames } from '$lib/wharf/chains';

	const wharf = getWharf();
</script>

<Box>
	<Center>
		<Stack>
			<p>Language: {languageTag()}</p>
			<p>Test Localization String: {m.test_locale_string()}</p>

			<p>Select a network</p>
			{#each chainShortNames as chain}
				<Button href={`/${chain}`}>{chain}</Button>
			{/each}
		</Stack>
	</Center>
</Box>
