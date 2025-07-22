<script lang="ts">
	import { Button, Card, Stack, Switcher } from 'unicove-components';

	import * as m from '$lib/paraglide/messages';
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
						{m.common_not_available_on({
							network: data.network.chain.name
						})}
					</Button>
				{/if}
			</Switcher>
		</Stack>
	</Card>
{/snippet}

<Stack>
	<h3 class="text-headline">{m.common_account_creation()}</h3>
	{@render Tool(
		'/create-account/direct',
		m.common_direct_account_creation(),
		m.common_direct_account_creation_description()
	)}
	{@render Tool(
		'/create-account/contract',
		m.common_smart_contract_account_creation(),
		m.common_smart_contract_account_creation_description()
	)}
</Stack>

<Stack>
	<h3 class="text-headline">{m.common_tokens()}</h3>
	{@render Tool(
		'/send',
		m.common_send_tokens({ token: '' }),
		'Send tokens from one account to another.'
	)}
	{@render Tool(
		`/send/${ramtoken.id.url}`,
		m.common_send_tokens({
			token: 'RAM'
		}),
		'Transfer RAM from one account to another.',
		data.network.supports('ramtransfer')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">RAM</h3>
	{@render Tool(
		'/ram',
		m.common_ram_market(),
		'Overview of the RAM market on the network.',
		data.network.supports('rammarket')
	)}
	{@render Tool(
		'/ram/buy',
		m.search_result_description_buyram(),
		'Buy RAM from the network.',
		data.network.supports('rammarket')
	)}
	{@render Tool(
		'/ram/sell',
		m.search_result_description_sellram(),
		'Sell RAM to the network.',
		data.network.supports('rammarket')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">{m.common_staking()}</h3>
	{@render Tool(
		'/staking',
		m.search_result_description_staking(),
		'Overview of the staking process on the network.',
		data.network.supports('staking')
	)}
	{@render Tool(
		'/staking/stake',
		m.common_stake(),
		'Add tokens to a staked balance.',
		data.network.supports('staking')
	)}
	{@render Tool(
		'/staking/unstake',
		m.common_unstake(),
		'Start the unstaking process of staked tokens.',
		data.network.supports('staking')
	)}
	{@render Tool(
		'/staking/withdraw',
		m.common_withdraw(),
		'Withdraw tokens from the staking contract.',
		data.network.supports('staking')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">
		{m.resources_network_title({
			network: ''
		})}
	</h3>
	{@render Tool(
		'/resources',
		m.common_resources(),
		'Overview of the currenet accounts network resources and options to manage them.'
	)}
	{@render Tool(
		'/resources/powerup',
		m.resources_rent_with_powerup(),
		'Use the powerup system to rent CPU and/or NET resources.',
		data.network.supports('powerup')
	)}
	{@render Tool(
		'/resources/rex',
		m.resources_rent_with_rex(),
		'Use the REX system to rent CPU and/or NET resources.',
		data.network.supports('rentrex')
	)}
	{@render Tool(
		'/resources/stake',
		m.resources_rent_with_stake({
			symbolName: data.network.token.symbol.name
		}),
		'Stake tokens to gain access to CPU and NET resources.',
		data.network.supports('stakeresource')
	)}
</Stack>

<Stack>
	<h3 class="text-headline">{m.common_swaps()}</h3>
	{@render Tool(
		'/swaps',
		m.common_swaps(),
		'List of the swaps natively available on the network.',
		market.market.swaps.length > 0
	)}
</Stack>

<Stack>
	<h3 class="text-headline">{m.common_delegated()}</h3>
	{@render Tool(
		'/undelegate',
		m.common_reclaim_delegated_tokens({ token: data.network.token.name }),
		m.delegation_metadata_refund_description({ network: data.network })
	)}
</Stack>

<Stack>
	<h3 class="text-headline">{m.common_block_explorer()}</h3>
	<p>
		Each link below is an example of an explorer feature on Unicove. The search at the top of the
		page can be used to find instances of these types of information.
	</p>
	{@render Tool('/account/eosio.token', m.account_page(), 'View details about a specific account.')}
	{@render Tool(
		'/block/123456789',
		m.block_page_details(),
		'View details about a specific block on the network.'
	)}
	{@render Tool(
		'/producers',
		m.common_block_producers(),
		'View information about the block producers on the network.'
	)}
	{@render Tool(
		'/contract/eosio.token',
		m.common_contract(),
		'View details about a smart contract, the data, actions, and structure.'
	)}
	{@render Tool(
		'/msig/test.gm/testprop',
		m.msig_details(),
		'View details about a multi-signature proposal.'
	)}
	{@render Tool(
		'/key/PUB_K1_7oWuonsNqqoStWuQgfLfY7w88w3NwghwbPzpiieKimj7iqHnKF',
		m.common_public_key(),
		'View details about a public key and the associated accounts.'
	)}
	{@render Tool(
		'/token/core.vaulta/A',
		m.common_tokens(),
		'View overview of a token deployed to the network.'
	)}
	{@render Tool(
		'/transaction/587dc971baabcae4121621c273e944ed8290e190938c8394eaf25b42aee41c48',
		m.common_transaction(),
		'View details about a transaction that occurred on the network.'
	)}
</Stack>
