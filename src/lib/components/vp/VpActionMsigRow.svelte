<script lang="ts">
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { VpMsigLinkAction } from '$lib/vp/actions';

	interface Props {
		model: VpMsigLinkAction;
	}

	const { model }: Props = $props();
	const context = getContext<UnicoveContext>('state');

	let approved = $state<number | null>(null);
	let total = $state<number | null>(null);

	$effect(() => {
		if (!model.live) {
			return;
		}
		const controller = new AbortController();
		fetch(context.urlPath(`/api/msig/${model.proposer}/${model.proposal}`), {
			signal: controller.signal
		})
			.then((response) => response.json())
			.then((json) => {
				if (json && !('error' in json) && Array.isArray(json.provided_approvals)) {
					const provided = json.provided_approvals.length;
					const requested = Array.isArray(json.requested_approvals)
						? json.requested_approvals.length
						: 0;
					approved = provided;
					total = provided + requested;
				}
			})
			.catch(() => {});
		return () => controller.abort();
	});
</script>

<div class="grid gap-2">
	<h3 class="text-label-sm text-muted">Multisig {model.proposer}/{model.proposal}</h3>
	<div class="flex flex-wrap items-center gap-3">
		<a class="text-primary font-medium hover:underline" href={context.urlPath(model.msigPath)}>
			{#if model.live}
				Review and approve on the multisig page
			{:else}
				View the multisig
			{/if}
		</a>
		{#if model.live && approved !== null && total !== null}
			<span class="text-muted text-sm">{approved} of {total} approvals signed</span>
		{/if}
	</div>
</div>
