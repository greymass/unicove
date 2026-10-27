<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { CreationindexClient, type Creation } from '$lib/state/creationindex/client';
	import { KIND_COLORS, creationKind } from '$lib/state/creationindex/origins';
	import { formatDateTime } from '$lib/utils/intl';
	import ContributionBytes from './contributionbytes.svelte';
	import { kindLabel } from './labels.svelte';

	interface Props {
		account: string;
	}

	let { account }: Props = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const client = new CreationindexClient(context.urlPath('/api/creationindex'));

	let creation = $state<Creation | null>(null);

	$effect(() => {
		const name = account;
		creation = null;
		client
			.getCreation(name)
			.then((result) => {
				if (name === account) creation = result;
			})
			.catch(() => {});
	});

	const kind = $derived(creation ? creationKind(creation) : 'none');
	const contribution = $derived(creation?.contributions[0]);
	const stated = $derived(
		contribution &&
			(contribution.bytes !== null ||
				contribution.requested_bytes !== null ||
				contribution.quantity)
	);
	const created = $derived(
		creation
			? formatDateTime(new Date(creation.block_time), locale, {
					dateStyle: 'medium',
					timeStyle: undefined,
					timeZone: 'UTC'
				})
			: ''
	);
</script>

{#if creation}
	<a
		href={context.urlPath(`/network/origins/${creation.creator}`)}
		class="text-muted hover:text-on-surface flex items-center gap-2 px-1 text-xs"
	>
		<span class="size-2 shrink-0 rounded-full" style:background={KIND_COLORS[kind]}></span>
		<span>
			Created by <span class="text-on-surface">{creation.creator}</span> on {created} · {kindLabel(
				kind
			)}{#if contribution && stated},
				<ContributionBytes {contribution} />{/if}
		</span>
	</a>
{/if}
