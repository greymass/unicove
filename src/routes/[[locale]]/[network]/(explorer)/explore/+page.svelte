<script lang="ts">
	import {
		UserIcon,
		FileTextIcon,
		KeyRoundIcon,
		UsersIcon,
		NetworkIcon,
		CoinsIcon,
		// ActivityIcon,
		BlocksIcon
	} from '@lucide/svelte';
	import { localizePath } from '$lib/utils/url';
	import { getBlocks } from '$lib/remote/blocks.remote';
	// import { getTransactions } from '$lib/remote/transactions.remote';
	import ExploreCard from './ExploreCard.svelte';
	import ExploreButton from './ExploreButton.svelte';
	import { Key, Stack } from 'unicove-components';

	const explorerSections = [
		{
			title: 'Accounts',
			description: 'Explore account information, balances, permissions, and activity',
			icon: UserIcon,
			items: [
				{ label: 'eosio', href: '/account/eosio', description: 'System account' },
				{ label: 'unicove.gm', href: '/account/unicove.gm', description: 'Unicove account' },
				{
					label: 'eosio.token',
					href: '/account/eosio.token',
					description: 'Token contract account'
				},
				{ label: 'eosio.ram', href: '/account/eosio.ram', description: 'RAM market account' },
				{ label: 'eosio.stake', href: '/account/eosio.stake', description: 'Staking account' }
			]
		},
		// {
		// 	title: 'Blocks',
		// 	description: 'Browse blockchain blocks and their transactions',
		// 	icon: BlocksIcon,
		// 	items: getBlocks()
		// 	// items: blocks.map((b) => ({
		// 	// 	label: b.block_num,
		// 	// 	description: b.producer,
		// 	// 	href: `/block/${b.block_num}`
		// 	// }))
		// },
		{
			title: 'Contracts',
			description: 'Inspect smart contracts, ABIs, actions, and data tables',
			icon: FileTextIcon,
			items: [
				{ label: 'eosio', href: '/contract/eosio', description: 'System contract' },
				{ label: 'eosio.token', href: '/contract/eosio.token', description: 'Token contract' },
				{ label: 'unicove', href: '/contract/unicove.gm', description: 'Unicove contract' },
				{ label: 'eosio.rex', href: '/contract/eosio.rex', description: 'REX contract' },
				{ label: 'eosio.msig', href: '/contract/eosio.msig', description: 'Multi-sig contract' }
			]
		},
		{
			title: 'Keys',
			description: 'Investigate public keys and associated accounts',
			icon: KeyRoundIcon,
			items: [
				{
					label: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
					href: '/key/EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
					description: 'eosio system key'
				},
				{
					label: 'PUB_K1_6RWZ1CmDL4B6LdixuertnzxcRuUDac3NQspJEvMnebGcXY4zZj',
					href: '/key/PUB_K1_6RWZ1CmDL4B6LdixuertnzxcRuUDac3NQspJEvMnebGcXY4zZj',
					description: 'unicove account key'
				}
			]
		},

		// {
		// 	title: 'Transactions',
		// 	description: 'Analyze transaction details, actions, and traces',
		// 	icon: ActivityIcon,
		// 	items: transactions.map((t) => ({
		// 		label: t.id.substring(0, 16) + '...',
		// 		href: `/transaction/${t.id}`,
		// 		description: `Block ${t.block_num} • ${t.actions_count} actions • ${t.status}`
		// 	}))
		// },

		// {
		// 	title: 'Multi-Signatures',
		// 	description: 'Review and manage multi-signature proposals',
		// 	icon: UsersIcon,
		// 	items: [
		// 		{
		// 			label: 'eosio/msig.proposal1',
		// 			href: '/msig/eosio/msig.proposal1',
		// 			description: 'System proposal'
		// 		},
		// 		{
		// 			label: 'b1/msig.proposal2',
		// 			href: '/msig/b1/msig.proposal2',
		// 			description: 'Block.one proposal'
		// 		},
		// 		{
		// 			label: 'eosio.token/msig.tokenupdate',
		// 			href: '/msig/eosio.token/msig.tokenupdate',
		// 			description: 'Token proposal'
		// 		},
		// 		{
		// 			label: 'eosio.ram/msig.ramconfig',
		// 			href: '/msig/eosio.ram/msig.ramconfig',
		// 			description: 'RAM proposal'
		// 		},
		// 		{
		// 			label: 'eosio.stake/msig.stakechange',
		// 			href: '/msig/eosio.stake/msig.stakechange',
		// 			description: 'Staking proposal'
		// 		}
		// 	]
		// },

		{
			title: 'Network',
			description: 'Monitor network status and producers',
			icon: NetworkIcon,
			items: [
				{
					label: 'Network Overview',
					href: '/network',
					description: 'Network statistics and status'
				},
				{ label: 'Block Producers', href: '/producers', description: 'Active producer list' },
				{ label: 'Producer eosio', href: '/producers/eosio', description: 'System producer' },
				{ label: 'Producer bp1', href: '/producers/bp1', description: 'Example producer 1' },
				{ label: 'Producer bp2', href: '/producers/bp2', description: 'Example producer 2' }
			]
		},
		{
			title: 'Tokens',
			description: 'Explore token contracts and token information',
			icon: CoinsIcon,
			items: [{ label: 'A', href: '/token/core.vaulta/A', description: 'Native system token' }]
		}
	];
</script>

<div class="grid grid-cols-2 gap-6">
	<ExploreCard
		title="Blocks"
		description="Browse blockchain blocks and their transactions"
		icon={BlocksIcon}
	>
		<Stack class="gap-3">
			{#each await getBlocks() as block}
				<ExploreButton
					label={block.block_num.toString()}
					description={block.producer.toString()}
					href={localizePath(`/block/${block.block_num}`)}
				/>
			{/each}
		</Stack>
	</ExploreCard>

	{#each explorerSections as section}
		<ExploreCard {...section} />
	{/each}
</div>
