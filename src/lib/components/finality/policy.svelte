<script lang="ts">
	import { getContext } from 'svelte';
	import { DD, DL, DLRow } from '@wharfkit/svelte-components';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { PolicyMessage } from '$lib/state/finality/v1';
	import { formatNumber } from '$lib/utils/intl';

	const {
		policy,
		scheduleVersion
	}: { policy: PolicyMessage | null; scheduleVersion: number | null } = $props();

	const context = getContext<UnicoveContext>('state');
	const locale = $derived(context.settings.data.locale);
	const weight = $derived(policy?.finalizers.reduce((sum, f) => sum + f.weight, 0) ?? 0);
</script>

{#if !policy}
	<p class="text-muted text-sm">Waiting for the first blocks</p>
{:else}
	<DL>
		<DLRow title="Generation"><DD>{policy.generation}</DD></DLRow>
		<DLRow title="Threshold">
			<DD>{formatNumber(policy.threshold, locale)} of {formatNumber(weight, locale)}</DD>
		</DLRow>
		<DLRow title="Finalizers"><DD>{formatNumber(policy.finalizers.length, locale)}</DD></DLRow>
		<DLRow title="Pending policy">
			<DD>
				{#if policy.pending}
					Generation {policy.pending.generation}, {formatNumber(
						policy.pending.finalizers.length,
						locale
					)}
					finalizers
				{:else}
					None
				{/if}
			</DD>
		</DLRow>
		<DLRow title="Proposer schedule version"><DD>{scheduleVersion ?? '–'}</DD></DLRow>
	</DL>
{/if}
