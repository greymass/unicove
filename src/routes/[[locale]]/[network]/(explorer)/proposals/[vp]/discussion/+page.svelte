<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Stack } from 'unicove-components';
	import { SvelteMap } from 'svelte/reactivity';
	import Thread from '$lib/components/discussion/Thread.svelte';
	import {
		descriptorFromParam,
		proposalDescriptors,
		type TargetDescriptor
	} from '$lib/discussion/targets';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import { Name } from '@wharfkit/antelope';

	const { data } = $props();
	const context = getContext<UnicoveContext>('state');

	const descriptors = $derived(proposalDescriptors(data.summary, data.lang));
	const active = $derived(descriptorFromParam(descriptors, page.url.searchParams.get('target')));

	function select(d: TargetDescriptor | null) {
		const url = new URL(page.url);
		if (d) url.searchParams.set('target', d.key);
		else url.searchParams.delete('target');
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	const votes = new SvelteMap<string, number>();
	const userVotes = new SvelteMap<string, number | null>();

	$effect(() => {
		for (const d of descriptors) {
			const path =
				d.target.kind === 'msig'
					? `/api/sentiment/msigs/${d.target.proposer}/${d.target.proposal}/votes?page=1&limit=200`
					: `/api/sentiment/topics/${d.target.topic}/votes?page=1&limit=200`;
			fetch(context.urlPath(path))
				.then((r) => (r.ok ? r.json() : null))
				.then((json) => {
					for (const v of json?.data?.votes ?? []) votes.set(v.voter, v.voteType);
				})
				.catch(() => {});
		}
	});

	async function loadUserVote(voter: Name, d: TargetDescriptor) {
		try {
			const r =
				d.target.kind === 'msig'
					? await context.network.contracts.sentiment.readonly('getmsigvote', {
							voter,
							proposer: Name.from(d.target.proposer),
							proposal_name: Name.from(d.target.proposal)
						})
					: await context.network.contracts.sentiment.readonly('getvote', {
							voter,
							topic_id: Name.from(d.target.topic)
						});
			userVotes.set(d.key, r ? Number(r.vote_type) : null);
		} catch {
			userVotes.set(d.key, null);
		}
	}

	$effect(() => {
		const account = context.account;
		if (!account) return;
		for (const d of descriptors) loadUserVote(account.name, d);
	});
</script>

<article class="@container">
	<Stack class="gap-6">
		<h2 class="text-on-surface text-headline">Discussion</h2>
		<Thread
			{descriptors}
			{active}
			onselect={select}
			{votes}
			{userVotes}
			onuservote={(d, v) => userVotes.set(d.key, v)}
			showChips={descriptors.length > 1}
			locale={data.lang}
		/>
	</Stack>
</article>
