<script lang="ts">
	// import { getContext } from 'svelte';
	import { Card, Stack, Button } from 'unicove-components';
	import {
		UserIcon,
		FileTextIcon,
		KeyIcon,
		UsersIcon,
		NetworkIcon,
		CoinsIcon,
		ActivityIcon,
		BlocksIcon
	} from '@lucide/svelte';
	// import type { UnicoveContext } from '$lib/state/client.svelte';
	import { localizePath } from '$lib/utils/url';

	// const context = getContext<UnicoveContext>('state');

	const explorerSections = [
		{
			title: 'Accounts',
			description: 'Explore account information, balances, permissions, and activity',
			icon: UserIcon,
			items: [
				{ label: 'eosio', href: '/account/eosio', description: 'System account' },
				{ label: 'b1', href: '/account/b1', description: 'Block.one account' },
				{
					label: 'eosio.token',
					href: '/account/eosio.token',
					description: 'Token contract account'
				},
				{ label: 'eosio.ram', href: '/account/eosio.ram', description: 'RAM market account' },
				{ label: 'eosio.stake', href: '/account/eosio.stake', description: 'Staking account' }
			]
		},
		{
			title: 'Blocks',
			description: 'Browse blockchain blocks and their transactions',
			icon: BlocksIcon,
			items: [
				{ label: 'Block 1', href: '/block/1', description: 'First block' },
				{ label: 'Block 100', href: '/block/100', description: 'Early block' },
				{ label: 'Block 1000', href: '/block/1000', description: 'Milestone block' },
				{ label: 'Block 10000', href: '/block/10000', description: 'Recent block' },
				{ label: 'Block 100000', href: '/block/100000', description: 'Latest block' }
			]
		},
		{
			title: 'Contracts',
			description: 'Inspect smart contracts, ABIs, actions, and data tables',
			icon: FileTextIcon,
			items: [
				{ label: 'eosio', href: '/contract/eosio', description: 'System contract' },
				{ label: 'eosio.token', href: '/contract/eosio.token', description: 'Token contract' },
				{ label: 'eosio.ram', href: '/contract/eosio.ram', description: 'RAM market contract' },
				{ label: 'eosio.rex', href: '/contract/eosio.rex', description: 'REX contract' },
				{ label: 'eosio.msig', href: '/contract/eosio.msig', description: 'Multi-sig contract' }
			]
		},
		{
			title: 'Keys',
			description: 'Investigate public keys and associated accounts',
			icon: KeyIcon,
			items: [
				{
					label: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
					href: '/key/EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
					description: 'System key'
				},
				{
					label: 'EOS5kfnT3G1h5R5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
					href: '/key/EOS5kfnT3G1h5R5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z',
					description: 'Example key 1'
				},
				{
					label: 'EOS7K9P3qL4m2X8Y5R6T1W3V7B9N2M4Q6S8U0I2O4A6C8E0G2I4K6M8',
					href: '/key/EOS7K9P3qL4m2X8Y5R6T1W3V7B9N2M4Q6S8U0I2O4A6C8E0G2I4K6M8',
					description: 'Example key 2'
				},
				{
					label: 'EOS8L2N5M7Q9R1T3V5X7Z9B2D4F6H8J0K2L4N6P8R0T2V4X6Z8B0D2F4H6J8',
					href: '/key/EOS8L2N5M7Q9R1T3V5X7Z9B2D4F6H8J0K2L4N6P8R0T2V4X6Z8B0D2F4H6J8',
					description: 'Example key 3'
				},
				{
					label: 'EOS9M3N5P7R9T1V3X5Z7B9D2F4H6J8K0L2N4P6R8T0V2X4Z6B8D0F2H4J6K8',
					href: '/key/EOS9M3N5P7R9T1V3X5Z7B9D2F4H6J8K0L2N4P6R8T0V2X4Z6B8D0F2H4J6K8',
					description: 'Example key 4'
				}
			]
		},
		{
			title: 'Transactions',
			description: 'Analyze transaction details, actions, and traces',
			icon: ActivityIcon,
			items: [
				{
					label: '0000000000000000000000000000000000000000000000000000000000000000',
					href: '/transaction/0000000000000000000000000000000000000000000000000000000000000000',
					description: 'Genesis transaction'
				},
				{
					label: '1111111111111111111111111111111111111111111111111111111111111111',
					href: '/transaction/1111111111111111111111111111111111111111111111111111111111111111',
					description: 'Example transaction 1'
				},
				{
					label: '2222222222222222222222222222222222222222222222222222222222222222',
					href: '/transaction/2222222222222222222222222222222222222222222222222222222222222222',
					description: 'Example transaction 2'
				},
				{
					label: '3333333333333333333333333333333333333333333333333333333333333333',
					href: '/transaction/3333333333333333333333333333333333333333333333333333333333333333',
					description: 'Example transaction 3'
				},
				{
					label: '4444444444444444444444444444444444444444444444444444444444444444',
					href: '/transaction/4444444444444444444444444444444444444444444444444444444444444444',
					description: 'Example transaction 4'
				}
			]
		},
		{
			title: 'Multi-Signatures',
			description: 'Review and manage multi-signature proposals',
			icon: UsersIcon,
			items: [
				{
					label: 'eosio/msig.proposal1',
					href: '/msig/eosio/msig.proposal1',
					description: 'System proposal'
				},
				{
					label: 'b1/msig.proposal2',
					href: '/msig/b1/msig.proposal2',
					description: 'Block.one proposal'
				},
				{
					label: 'eosio.token/msig.tokenupdate',
					href: '/msig/eosio.token/msig.tokenupdate',
					description: 'Token proposal'
				},
				{
					label: 'eosio.ram/msig.ramconfig',
					href: '/msig/eosio.ram/msig.ramconfig',
					description: 'RAM proposal'
				},
				{
					label: 'eosio.stake/msig.stakechange',
					href: '/msig/eosio.stake/msig.stakechange',
					description: 'Staking proposal'
				}
			]
		},
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
			items: [
				{ label: 'EOS', href: '/token/eosio.token/EOS', description: 'Native system token' },
				{ label: 'USDT', href: '/token/tethertether/USDT', description: 'Tether USD' },
				{ label: 'USDC', href: '/token/eosio.token/USDC', description: 'USD Coin' },
				{ label: 'BTC', href: '/token/eosio.token/BTC', description: 'Bitcoin token' },
				{ label: 'ETH', href: '/token/eosio.token/ETH', description: 'Ethereum token' }
			]
		}
	];
</script>

<Stack>
	{#each explorerSections as section}
		{@const IconComponent = section.icon}
		<Card>
			<Stack class="gap-4">
				<div class="flex items-center gap-3">
					<div class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
						<IconComponent class="text-primary h-5 w-5" />
					</div>
					<div class="space-y-2">
						<h3 class="text-title">{section.title}</h3>
						<p class="text-muted text-label-sm">{section.description}</p>
					</div>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					{#each section.items as item}
						<Button
							variant="text"
							href={localizePath(item.href)}
							class="h-auto justify-start p-4 text-left"
						>
							<div class="flex flex-col gap-1">
								<span class="font-medium">{item.label}</span>
								<span class="text-muted text-xs">{item.description}</span>
							</div>
						</Button>
					{/each}
				</div>
			</Stack>
		</Card>
	{/each}
</Stack>
