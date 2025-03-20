<script lang="ts">
	import { useIntersectionObserver } from 'runed';
	import { fade } from 'svelte/transition';

	let target = $state<HTMLElement | null>(null);
	let root = $state<HTMLElement | null>(null);
	let isIntersecting = $state(true);

	useIntersectionObserver(
		() => target,
		(entries) => {
			const entry = entries[0];
			if (!entry) console.log('no entry');
			console.log(entry);
			isIntersecting = entry.isIntersecting;
		},
		{ root: () => root }
	);

	$inspect(isIntersecting);
</script>

<article class="grid grid-cols-3 gap-12">
	<header class="col-span-3" bind:this={target}>
		<div class="h-56 rounded-lg bg-red-200"></div>
	</header>
	{#if !isIntersecting}
		<aside transition:fade={{ duration: 100 }} class="relative col-start-3 row-start-2">
			<div class="sticky top-8 h-48 rounded-lg bg-red-200"></div>
		</aside>
	{/if}
	<section class="prose prose-invert col-span-2 text-pretty">
		<h2 class="h2 text-pretty leading-tight">
			EOS to Vaulta: A Major Rebrand Launching Web3 Banking
		</h2>

		<p>
			TLDR: EOS Network is rebranding to "Vaulta" in May 2025. Current EOS token holders will need
			to swap their tokens through an official portal. The token swap will be 1:1 and bi-directional
			for four months. Mark your calendars and prepare to participate in the swap.
		</p>
		<p>
			The cryptocurrency project known as EOS Network is rebranding to "Vaulta" as it positions
			itself to become a leader in the emerging Web3 Banking space. This strategic transformation,
			scheduled for the end of May 2025, represents a significant evolution for the platform as it
			expands beyond its original blockchain focus into a comprehensive financial ecosystem.
		</p>
		<h3>What Is Changing?</h3>
		<p>
			EOS Network will officially become "Vaulta" – described as "a bold leap into the next frontier
			of finance: Web3 Banking." This isn't merely a cosmetic change; it represents a fundamental
			shift in the platform's focus and capabilities.
		</p>

		<p>The rebrand includes:</p>

		<ul>
			<li>A new name and brand identity: From EOS Network to Vaulta</li>
			<li>A token swap: EOS tokens will be exchanged for Vaulta tokens at a 1:1 ratio</li>
			<li>
				An expanded focus on four key financial pillars: Wealth Management, Consumer Payments,
				Portfolio Investment, and Insurance
			</li>
		</ul>

		<p>
			Current EOS token holders should note that the token swap portal will launch at the end of May
			2025, allowing for a bi-directional swap for the first four months. After this grace period,
			the swap will become one-way only.
		</p>

		<h3>Why The Rebrand?</h3>
		<p>The transformation comes in response to several major trends reshaping finance:</p>

		<ol>
			<li>
				Growing Cryptocurrency Adoption: Global crypto users have expanded from 100 million in 2020
				to over 600 million by late 2024, with particular growth among the 18-34 age demographic.
			</li>
			<li>
				Stablecoin Market Expansion: The stablecoin market is projected to reach nearly $190 billion
				annually by 2026, dramatically reducing global transaction fees from traditional averages of
				approximately 6.65% to less than 0.1%.
			</li>
			<li>
				Real-World Asset Tokenization: The tokenization of physical assets is expected to grow from
				$310 billion in 2022 to approximately $16 trillion by 2030.
			</li>
		</ol>

		<p>
			According to the announcement, the rebrand allows the platform to better position itself at
			the intersection of traditional finance and blockchain technology, with a particular focus on
			making sophisticated financial products more accessible to everyday users.
		</p>

		<h3>How Will The Transition Work?</h3>
		<p>The transition plan includes several key components:</p>

		<ul>
			<li>
				Token Swap: A dedicated portal will launch in May 2025, allowing holders to exchange EOS
				tokens for Vaulta tokens at a 1:1 ratio
			</li>

			<li>
				Exchange Coordination: Major exchanges will handle the swap process automatically for users
			</li>
			<li>
				Smart Contract Updates: Some smart contracts may require minor adjustments, with
				documentation provided in advance
			</li>
			<li>
				Unchanged Tokenomics: The total supply, allocation, and vesting schedules remain the same
			</li>
		</ul>

		<p>
			Vaulta's technical foundation includes five key components: Enterprise-Ready Smart Contracts,
			Direct Bitcoin Integration via exSat, Decentralized On-Chain RAM Database, Cross-Chain
			Liquidity, and 1-second Transaction Finality. These elements are designed to create a
			financial network capable of supporting institutional-grade banking services.
		</p>

		<p>
			The platform has formed a Banking Advisory Council with executives from Systemic Trust, Tetra
			Trust, and ATB Financial to guide its development in the regulated finance space.
		</p>

		<h3>What To Do Now</h3>
		<p>
			If you're an EOS token holder, mark your calendar for the end of May 2025 when the token swap
			will begin. The swap process will be available through a dedicated portal and is expected to
			be straightforward.
		</p>

		<p>
			For those holding tokens on major exchanges, minimal action should be required as exchanges
			will manage the transition. However, it's recommended to stay informed through official
			channels as the date approaches.
		</p>
		<p>
			Smart contract developers may need to make adjustments, with detailed guidelines to be
			provided before the transition date.
		</p>

		<p>
			For investors interested in the Web3 Banking space, the announcement highlights that the $EOS
			token is "currently available on over 137 exchanges including every major exchange" and offers
			an estimated 17% APY through staking.
		</p>
		<p>
			As the platform states: "If you've been waiting for the moment to join the next financial
			evolution, there will never be a better time than now."
		</p>
	</section>
</article>
