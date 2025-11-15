<script lang="ts">
	import { Button, Card, Stack, Switcher } from 'unicove-components';

	import type { MarketContext } from '$lib/state/client.svelte.js';
	import { getContext } from 'svelte';
	import { ramtoken } from '$lib/wharf/chains';

	const { data } = $props();

	const market = getContext<MarketContext>('market');
</script>

{#snippet Tool(href: string, title: string, description: string, available = true)}
	<Card class="bg-surface-container" {title}>
		<Stack>
			<p>{description}</p>
			<Switcher>
				{#if available}
					<Button href={`/${data.network}${href}`}>
						{title}
					</Button>
				{:else}
					<Button disabled>
						Not available on {data.network.chain.name}
					</Button>
				{/if}
			</Switcher>
		</Stack>
	</Card>
{/snippet}

<Stack>
	<h3 class="text-headline">Account Creation</h3>
	{@render Tool(
		'/create-account/direct',
		'Direct Account Creation',
		'Use an existing account to create another account.'
	)}
	{@render Tool(
		'/create-account/contract',
		'Smart Contract Account Creation',
		'Create an account using a basic token transfer to a smart contract'
	)}
</Stack>

<Stack>
	<h3 class="text-headline">Tokens</h3>
	{@render Tool('/send', 'Send Tokens', 'Send tokens from one account to another.')}
	{@render Tool(
		`/send/${ramtoken.id.url}`,
		'Send RAM Tokens',
		'Transfer RAM from one account to another.',
		data.network.supports('ramtransfer')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">RAM</h3>
	{@render Tool(
		'/ram',
		'RAM Market',
		'Overview of the RAM market on the network.',
		data.network.supports('rammarket')
	)}
	{@render Tool(
		'/ram/buy',
		'Purchase RAM',
		'Buy RAM from the network.',
		data.network.supports('rammarket')
	)}
	{@render Tool(
		'/ram/sell',
		'Sell RAM',
		'Sell RAM to the network.',
		data.network.supports('rammarket')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">Staking</h3>
	{@render Tool(
		'/staking',
		'Staking overview',
		'Overview of the staking process on the network.',
		data.network.supports('staking')
	)}
	{@render Tool(
		'/staking/stake',
		'Stake',
		'Add tokens to a staked balance.',
		data.network.supports('staking')
	)}
	{@render Tool(
		'/staking/unstake',
		'Unstake',
		'Start the unstaking process of staked tokens.',
		data.network.supports('staking')
	)}
	{@render Tool(
		'/staking/withdraw',
		'Withdraw',
		'Withdraw tokens from the staking contract.',
		data.network.supports('staking')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">{`${data.network.chain.name} Network Resources`}</h3>
	{@render Tool(
		'/resources',
		'Resources',
		'Overview of the currenet accounts network resources and options to manage them.'
	)}
	{@render Tool(
		'/resources/powerup',
		'Rent resources with PowerUp',
		'Use the powerup system to rent CPU and/or NET resources.',
		data.network.supports('powerup')
	)}
	{@render Tool(
		'/resources/rex',
		'Rent resources with REX',
		'Use the REX system to rent CPU and/or NET resources.',
		data.network.supports('rentrex')
	)}
	{@render Tool(
		'/resources/stake',
		`Stake ${data.network.token.symbol.name} for resources`,
		'Stake tokens to gain access to CPU and NET resources.',
		data.network.supports('stakeresource')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">Swaps</h3>
	{@render Tool(
		'/swaps',
		'Swaps',
		'List of the swaps natively available on the network.',
		market.market.swaps.length > 0
	)}
</Stack>

<Stack>
	<h3 class="text-headline">Delegated</h3>
	{@render Tool(
		'/undelegate',
		`Reclaim Delegated ${data.network.token.name} Tokens`,
		`Claim previously delegated ${data.network.chain.name} tokens.`
	)}
</Stack>

<Stack>
	<h3 class="text-headline">Block Explorer</h3>
	<p>
		Each link below is an example of an explorer feature on Unicove. The search at the top of the
		page can be used to find instances of these types of information.
	</p>
	{@render Tool('/account/eosio.token', 'Account Page', 'View details about a specific account.')}
	{@render Tool(
		'/block/123456789',
		'Block Details',
		'View details about a specific block on the network.'
	)}
	{@render Tool(
		'/producers',
		'Block Producers',
		'View information about the block producers on the network.'
	)}
	{@render Tool(
		'/contract/eosio.token',
		'Contract',
		'View details about a smart contract, the data, actions, and structure.'
	)}
	{@render Tool(
		'/msig/test.gm/testprop',
		'Multisig Details',
		'View details about a multi-signature proposal.'
	)}
	{@render Tool(
		'/key/PUB_K1_7oWuonsNqqoStWuQgfLfY7w88w3NwghwbPzpiieKimj7iqHnKF',
		'Public Key',
		'View details about a public key and the associated accounts.'
	)}
	{@render Tool(
		'/token/core.vaulta/A',
		'Tokens',
		'View overview of a token deployed to the network.'
	)}
	{@render Tool(
		'/transaction/587dc971baabcae4121621c273e944ed8290e190938c8394eaf25b42aee41c48',
		'Transaction',
		'View details about a transaction that occurred on the network.'
	)}
</Stack>
