<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
</script>

<p>Here's the things you can do with your account, {context.account?.name}!</p>
