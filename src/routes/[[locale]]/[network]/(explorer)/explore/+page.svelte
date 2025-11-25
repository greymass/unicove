<script lang="ts">
	import { Card, Stack, Button } from 'unicove-components';
	import {
		UserIcon,
		FileTextIcon,
		KeyRoundIcon,
		UsersIcon,
		NetworkIcon,
		CoinsIcon,
		ActivityIcon,
		BlocksIcon
	} from '@lucide/svelte';
	import { localizePath } from '$lib/utils/url';

	const { data } = $props();

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
		{
			title: 'Blocks',
			description: 'Browse blockchain blocks and their transactions',
			icon: BlocksIcon,
			items: data.blocks.map((b) => ({
				label: b.block_num,
				description: b.producer,
				href: `/block/${b.block_num}`
			}))
		},
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
				{ label: 'A', href: '/token/core.vaulta/A', description: 'Native system token' },
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
				<div class="flex items-center gap-4">
					<picture class="bg-surface-container-high grid size-12 place-items-center rounded-full">
						<IconComponent />
					</picture>
					<div class="space-y-2">
						<h3 class="text-title">{section.title}</h3>
						<p class="text-muted text-label-sm">{section.description}</p>
					</div>
				</div>

				<div class="grid gap-3">
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
