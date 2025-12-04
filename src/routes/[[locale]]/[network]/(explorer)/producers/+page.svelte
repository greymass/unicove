<script lang="ts">
	import { getContext } from 'svelte';
	import { watch } from 'runed';
	import { Asset, type Float64 } from '@wharfkit/antelope';
	import { Button, Card, Chip, Stack, NameInput } from 'unicove-components';
	import AccountLink from '$lib/components/elements/account.svelte';
	import TransactForm from '$lib/components/transact/form.svelte';
	import AssetText from '$lib/components/elements/asset.svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';
	import type { Checksum256 } from '@wharfkit/antelope';
	import { ProducerVoteState } from './state.svelte';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import {
		Vote,
		Shield,
		Server,
		Scale,
		Blocks,
		Clock,
		Hash,
		ChartNoAxesCombined
	} from '@lucide/svelte';
	import { page } from '$app/stores';

	const context = getContext<UnicoveContext>('state');
	const { producers } = context;

	const voteState = new ProducerVoteState(context.account, producers);

	watch(
		() => [context.account?.name.toString(), context.account?.loaded],
		() => {
			voteState.setAccount(context.account);
		}
	);

	function voteWeightToAsset(weight: Float64) {
		const defaultDecay = 52;
		const precision = 10 ** context.network.chain.systemToken!.symbol.precision;
		const timestamp = 946684800000;
		const dates = (Date.now() - timestamp) / 1000;
		const voteWeight = Math.floor(dates / (86400 * 7)) / defaultDecay;
		const calcWeight = 2 ** voteWeight;
		const value = Number(weight) / calcWeight / precision;
		return Asset.from(value, context.network.chain.systemToken!.symbol);
	}

	const votingWeight = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return null;
		}
		const staked = context.account.voter.staked;
		const symbol = context.network.config.systemtoken.symbol;
		return Asset.fromUnits(staked, symbol);
	});

	// Calculate vote age and decay
	const voteDecayInfo = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return null;
		}

		const staked = Number(context.account.voter.staked);
		const lastVoteWeight = Number(context.account.voter.weight);

		if (staked === 0 || lastVoteWeight === 0) {
			return null;
		}

		const precision = 10 ** context.network.chain.systemToken!.symbol.precision;
		const epoch = 946684800000; // Jan 1, 2000 in ms
		const msPerWeek = 86400 * 7 * 1000;
		const decayConstant = 52; // weeks for vote weight to double

		// Current vote weight multiplier
		const currentWeeks = Math.floor((Date.now() - epoch) / msPerWeek);
		const currentMultiplier = 2 ** (currentWeeks / decayConstant);

		// What the vote weight would be if voted now
		const freshVoteWeight = staked * currentMultiplier;

		// Calculate decay percentage
		const decayPercent = Math.max(0, (1 - lastVoteWeight / freshVoteWeight) * 100);

		// Reverse calculate when vote was cast
		const voteMultiplier = lastVoteWeight / staked;
		const voteWeeks = Math.log2(voteMultiplier) * decayConstant;
		const voteTimestamp = epoch + voteWeeks * msPerWeek;
		const voteDate = new Date(voteTimestamp);

		// Calculate age in days
		const ageMs = Date.now() - voteTimestamp;
		const ageDays = Math.floor(ageMs / (86400 * 1000));

		return {
			decayPercent: decayPercent.toFixed(1),
			voteDate,
			ageDays,
			effectiveWeight: Asset.from(
				lastVoteWeight / currentMultiplier / precision,
				context.network.chain.systemToken!.symbol
			)
		};
	});

	const currentVotes = $derived.by(() => {
		if (!context.account || !context.account.voter) {
			return [];
		}
		return context.account.voter.votes;
	});

	let transactionId = $state<Checksum256 | undefined>();
	let transactionError = $state<string | undefined>();
	let submitting = $state(false);

	async function handleVote() {
		if (!context.wharf || submitting) return;
		submitting = true;
		transactionError = undefined;
		try {
			const result = await voteState.submitVote(context.wharf, context.network.contracts.system);
			transactionId = result.resolved?.transaction.id;
			if (context.account) {
				await context.account.refresh();
			}
		} catch (e) {
			transactionError = e instanceof Error ? e.message : 'Failed to submit vote';
		} finally {
			submitting = false;
		}
	}

	function handleSuccess() {
		transactionId = undefined;
		// Sync initialVotes with current selection so UI doesn't reset
		voteState.confirmVote();
	}

	function handleFailure() {
		transactionError = undefined;
	}

	const tabOptions = $derived.by(() => {
		const base = context.urlPath('/producers');
		return [
			{ href: `${base}#account`, text: 'My Account', hash: 'account' },
			{ href: `${base}#why`, text: 'Why Vote?', hash: 'why' },
			{ href: `${base}#how`, text: 'How It Works', hash: 'how' }
		];
	});

	const activeTab = $derived.by(() => {
		const hash = $page.url.hash.slice(1);
		if (hash && ['account', 'why', 'how'].includes(hash)) {
			return hash;
		}
		return 'account';
	});

	let searchQuery = $state('');

	const filteredProducers = $derived.by(() => {
		if (!searchQuery) {
			return producers.activeProducers;
		}
		const searchStr = String(searchQuery).toLowerCase().trim();
		if (searchStr === '') {
			return producers.activeProducers;
		}
		return producers.activeProducers.filter((producer) =>
			String(producer.owner).toLowerCase().includes(searchStr)
		);
	});
</script>

{#snippet Success()}
	<div class="flex justify-center">
		<Button onclick={handleSuccess}>Done</Button>
	</div>
{/snippet}

{#snippet Failure()}
	<div class="flex justify-center">
		<Button onclick={handleFailure}>Back</Button>
	</div>
{/snippet}

<div class="space-y-6">
	<menu aria-label="page functions" class="flex gap-2 overflow-auto">
		{#each tabOptions as option}
			<li>
				<Button
					variant="pill"
					aria-current={activeTab === option.hash ? 'page' : undefined}
					href={option.href}
				>
					{option.text}
				</Button>
			</li>
		{/each}
	</menu>

	<Card>
		<Stack>
			{#if activeTab === 'account'}
				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div class="bg-primary/10 text-primary hidden shrink-0 rounded-xl p-3 sm:block">
							<Vote class="size-8" />
						</div>
						<div>
							<h2 class="text-on-surface mb-2 text-xl font-semibold">My Voting Power</h2>
							<p class="text-on-surface-variant text-sm leading-relaxed">
								Your voting power is determined by the amount of tokens you have staked.
							</p>
						</div>
					</div>

					{#if context.account && !context.account.loaded}
						<!-- Loading state while account data is being fetched -->
						<div class="grid gap-6 sm:grid-cols-3">
							<div class="text-center">
								<p class="text-on-surface-variant mb-1 text-sm">Staked Balance</p>
								<div class="flex justify-center">
									<div class="bg-surface-container h-8 w-24 animate-pulse rounded-lg"></div>
								</div>
							</div>
							<div class="text-center">
								<p class="text-on-surface-variant mb-1 text-sm">Vote Age</p>
								<div class="flex justify-center">
									<div class="bg-surface-container h-8 w-20 animate-pulse rounded-lg"></div>
								</div>
							</div>
							<div class="text-center">
								<p class="text-on-surface-variant mb-1 text-sm">Vote Decay</p>
								<div class="flex justify-center">
									<div class="bg-surface-container h-8 w-16 animate-pulse rounded-lg"></div>
								</div>
							</div>
						</div>
					{:else if context.account && votingWeight}
						<div class="grid gap-6 sm:grid-cols-3">
							<div class="text-center">
								<p class="text-on-surface-variant mb-1 text-sm">Staked Balance</p>
								<p class="text-on-surface text-2xl font-semibold">
									<AssetText variant="full" value={votingWeight} />
								</p>
							</div>

							{#if voteDecayInfo && currentVotes.length > 0}
								<div class="text-center">
									<p class="text-on-surface-variant mb-1 text-sm">Vote Age</p>
									<p class="text-on-surface text-2xl font-semibold">
										{voteDecayInfo.ageDays === 0
											? 'Today'
											: voteDecayInfo.ageDays === 1
												? '1 day'
												: `${voteDecayInfo.ageDays} days`}
									</p>
								</div>

								<div class="text-center">
									<p class="text-on-surface-variant mb-1 text-sm">Vote Decay</p>
									<p
										class="text-2xl font-semibold {Number(voteDecayInfo.decayPercent) > 10
											? 'text-error'
											: 'text-on-surface'}"
									>
										{voteDecayInfo.decayPercent}%
									</p>
								</div>
							{:else}
								<div class="text-center">
									<p class="text-on-surface-variant mb-1 text-sm">Liquid Balance</p>
									<p class="text-on-surface text-2xl font-semibold">
										<AssetText variant="full" value={context.account.balance.balance} />
									</p>
								</div>

								<div class="text-center">
									<p class="text-on-surface-variant mb-1 text-sm">Status</p>
									<p class="text-on-surface-variant text-2xl font-semibold">Not voting</p>
								</div>
							{/if}
						</div>
					{:else}
						<div
							class="border-outline-variant flex flex-col items-center gap-4 rounded-xl border border-dashed p-8 text-center"
						>
							<div class="bg-primary/10 text-primary rounded-full p-4">
								<Vote class="size-8" />
							</div>
							<div>
								<p class="text-on-surface text-lg font-medium">Connect to view your voting power</p>
								<p class="text-on-surface-variant mt-1 text-sm">
									Login to see your staked balance, vote age, and help secure the network.
								</p>
							</div>
							<Button onclick={() => context.wharf?.login()}>Connect Wallet</Button>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'why'}
				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div class="bg-primary/10 text-primary hidden shrink-0 rounded-xl p-3 sm:block">
							<Vote class="size-8" />
						</div>
						<div>
							<h2 class="text-on-surface mb-2 text-xl font-semibold">Why Should You Vote?</h2>
							<p class="text-on-surface-variant text-sm leading-relaxed">
								This network uses <strong class="text-on-surface"
									>Delegated Proof of Stake (DPoS)</strong
								>, a consensus mechanism where token holders elect block producers to validate
								transactions and secure the network. Your vote directly shapes who runs the
								infrastructure you depend on.
							</p>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Shield class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Validate Transactions</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									They verify and process every transaction on the network
								</p>
							</div>
						</div>

						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Blocks class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Produce Blocks</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									Every 0.5 seconds, producers bundle transactions into blocks
								</p>
							</div>
						</div>

						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Server class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Maintain Infrastructure</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									They provide servers, bandwidth, and storage that keep the network running 24/7
								</p>
							</div>
						</div>

						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Scale class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Govern the Network</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									Producers vote on protocol upgrades and critical decisions
								</p>
							</div>
						</div>
					</div>
				</div>
			{:else if activeTab === 'how'}
				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div class="bg-primary/10 text-primary hidden shrink-0 rounded-xl p-3 sm:block">
							<Scale class="size-8" />
						</div>
						<div>
							<h2 class="text-on-surface mb-2 text-xl font-semibold">How Voting Works</h2>
							<p class="text-on-surface-variant text-sm leading-relaxed">
								Voting for block producers is simple and flexible. Here's everything you need to
								know.
							</p>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<ChartNoAxesCombined class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Vote with Staked Tokens</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									Your vote weight equals the amount of tokens you have staked. More stake = more
									voting power.
								</p>
							</div>
						</div>

						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Hash class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Up to 30 Producers</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									Select as many as 30 block producers. Your full voting power applies to each one.
								</p>
							</div>
						</div>

						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Clock class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Votes Decay Over Time</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									Vote weight decays with a half-life of about one year. Re-vote periodically.
								</p>
							</div>
						</div>

						<div
							class="bg-surface-container flex gap-4 rounded-xl p-4 transition-shadow hover:shadow-md"
						>
							<div class="text-primary shrink-0">
								<Blocks class="size-6" />
							</div>
							<div>
								<h3 class="text-on-surface mb-1 font-semibold">Top 21 Produce Blocks</h3>
								<p class="text-on-surface-variant text-sm leading-relaxed">
									Only the top 21 voted producers actively create blocks. Others serve as standbys.
								</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</Stack>
	</Card>

	<div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
		<!-- Block Producers List -->
		<Card class="order-2 lg:order-1">
			<Stack>
				<div class="flex items-center justify-between gap-4">
					<h2 class="text-xl font-semibold">Block Producers</h2>
					<div class="w-64">
						<NameInput bind:value={searchQuery} placeholder="Search producers..." />
					</div>
				</div>
				{#if producers.loading}
					<div class="py-12 text-center">
						<p class="text-on-surface-variant">Loading producers...</p>
					</div>
				{:else if producers.error}
					<Stack>
						<p class="text-on-error-container">{producers.error}</p>
						<Button onclick={() => producers.loadProducers()}>Try Again</Button>
					</Stack>
				{:else if filteredProducers.length === 0}
					<div class="py-12 text-center">
						<p class="text-on-surface-variant">
							{searchQuery && String(searchQuery).trim()
								? 'No producers match your search'
								: 'No active producers found'}
						</p>
					</div>
				{:else}
					<table class="table-styles table-fixed">
						<thead>
							<tr>
								<th class="w-12"></th>
								<th class="w-10 text-center">#</th>
								<th class="w-20"></th>
								<th>Actor</th>
								<th class="w-40 text-right">Votes</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredProducers as producer, index (String(producer.owner))}
								<tr
									class="cursor-pointer"
									onclick={(e) => {
										if (
											e.target instanceof HTMLAnchorElement ||
											(e.target instanceof HTMLElement && e.target.closest('a'))
										) {
											return;
										}
										if (
											context.account &&
											(voteState.isSelected(producer.owner) || voteState.selected.size < 30)
										) {
											voteState.toggleProducer(producer.owner);
										}
									}}
								>
									<td>
										<div class="flex items-center justify-center">
											<input
												type="checkbox"
												id={`producer-${String(producer.owner)}`}
												checked={voteState.isSelected(producer.owner)}
												disabled={!context.account ||
													(!voteState.isSelected(producer.owner) && voteState.selected.size >= 30)}
												class="border-outline size-5 cursor-pointer rounded border disabled:cursor-not-allowed disabled:opacity-30"
											/>
										</div>
									</td>
									<td class="text-center">
										{index + 1}
									</td>
									<td>
										{#if index < 21}
											<Chip class="bg-success-container text-on-success-container">Top 21</Chip>
										{:else}
											<Chip class="bg-surface-variant text-on-surface-variant">Standby</Chip>
										{/if}
									</td>
									<td>
										<div class="flex items-center gap-2">
											<AccountLink name={producer.owner} />
											{#if producer.url}
												<a
													href={producer.url}
													target="_blank"
													rel="noopener noreferrer"
													class="text-on-surface-variant hover:text-on-surface inline-flex items-center justify-center transition-colors"
													onclick={(e) => e.stopPropagation()}
													title="Visit producer website"
												>
													<ExternalLink class="size-4" />
												</a>
											{/if}
										</div>
									</td>
									<td class="text-right">
										<div class="flex flex-col items-end">
											<AssetText value={voteWeightToAsset(producer.total_votes)} variant="short" />
											<span class="text-on-surface-variant text-sm">
												{producers.totalVotes > 0
													? ((Number(producer.total_votes) / producers.totalVotes) * 100).toFixed(2)
													: '0.00'}%
											</span>
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					{#if producers.hasMore && !producers.showAll && (!searchQuery || !String(searchQuery).trim())}
						<div class="flex justify-center pt-4">
							<Button variant="secondary" onclick={() => producers.loadMore()}>Load More</Button>
						</div>
					{/if}
				{/if}
			</Stack>
		</Card>

		<!-- Vote for Producers Sidebar -->
		<div class="order-1 lg:sticky lg:top-4 lg:order-2">
			<TransactForm
				id={transactionId}
				error={transactionError}
				onsuccess={Success}
				onfailure={Failure}
			>
				<Card>
					<Stack>
						<div class="flex flex-col">
							<h2 class="text-xl font-semibold">Vote for Producers</h2>
							<div class="flex-1 space-y-4 pt-4">
								{#if context.account && !context.account.loaded}
									<div class="flex items-center gap-2">
										<svg
											class="text-on-surface-variant size-4 animate-spin"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										<p class="text-on-surface-variant text-sm">Loading your votes...</p>
									</div>
								{:else}
									<p class="text-on-surface-variant text-sm">
										Selected {voteState.selected.size} of 30 producers
									</p>
								{/if}

								{#if voteState.addedProducers.length > 0}
									<div>
										<p class="text-sm font-medium">Will vote for:</p>
										<div class="mt-1 flex flex-wrap gap-2">
											{#each voteState.addedProducers as producer}
												<Chip class="bg-success-container text-on-success-container">
													{String(producer)}
												</Chip>
											{/each}
										</div>
									</div>
								{/if}
								{#if voteState.removedProducers.length > 0}
									<div>
										<p class="text-sm font-medium">Will remove vote from:</p>
										<div class="mt-1 flex flex-wrap gap-2">
											{#each voteState.removedProducers as producer}
												<Chip class="bg-error-container text-on-error-container">
													{String(producer)}
												</Chip>
											{/each}
										</div>
									</div>
								{/if}
							</div>

							<div class="flex gap-2 pt-4">
								<Button
									onclick={handleVote}
									disabled={!context.account ||
										!context.account.loaded ||
										!voteState.canVote ||
										submitting}
								>
									{#if submitting}
										Submitting...
									{:else if voteState.canRefresh}
										Refresh Vote
									{:else}
										Submit Vote
									{/if}
								</Button>
								{#if voteState.hasChanges}
									<Button variant="secondary" onclick={() => voteState.reset()}>Cancel</Button>
								{/if}
							</div>
						</div>
					</Stack>
				</Card>
			</TransactForm>
		</div>
	</div>
</div>
