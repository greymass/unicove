<script lang="ts">
	import { localizePath } from '$lib/utils/url';
	import { getBlocks } from '$lib/remote/blocks.remote';
	import {
		ArrowRightLeftIcon,
		// ActivityIcon,
		BlocksIcon,
		CoinsIcon,
		CpuIcon,
		FileTextIcon,
		KeyRoundIcon,
		MemoryStickIcon,
		NetworkIcon,
		SendIcon,
		ShieldIcon,
		TrendingUpIcon,
		UserIcon,
		UserPlus
	} from '@lucide/svelte';
	// import { getTransactions } from '$lib/remote/transactions.remote';
	import { Stack } from 'unicove-components';
	import ExploreButton from './ExploreButton.svelte';
	import ExploreCard from './ExploreCard.svelte';
	import { getContext } from 'svelte';
	import type { UnicoveContext } from '$lib/state/client.svelte';

	const context = getContext<UnicoveContext>('state');
	const accountName = $derived(context.account?.name);
</script>

<Stack class="gap-8">
	<section class="grid gap-4">
		<h2 class="text-headline">Explore</h2>
		<div class="grid grid-cols-2 items-start gap-6">
			<ExploreCard
				title="Blocks"
				description="Browse blockchain blocks and their transactions"
				icon={BlocksIcon}
			>
				<Stack class="gap-1">
					{#each await getBlocks() as block}
						<ExploreButton
							label={block.block_num.toString()}
							description={block.producer.toString()}
							href={localizePath(`/block/${block.block_num}`)}
						/>
					{/each}
				</Stack>
			</ExploreCard>

			<ExploreCard
				title="Accounts"
				description="Explore account information, balances, permissions, and activity"
				icon={UserIcon}
			>
				<Stack class="gap-1">
					<ExploreButton
						label="eosio"
						description="System account"
						href={localizePath('/account/eosio')}
					/>
					<ExploreButton
						label="unicove.gm"
						description="Unicove account"
						href={localizePath('/account/unicove.gm')}
					/>
					<ExploreButton
						label="eosio.token"
						description="Token contract account"
						href={localizePath('/account/eosio.token')}
					/>
					<ExploreButton
						label="eosio.ram"
						description="RAM market account"
						href={localizePath('/account/eosio.ram')}
					/>
					<ExploreButton
						label="eosio.stake"
						description="Staking account"
						href={localizePath('/account/eosio.stake')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard
				title="Contracts"
				description="Inspect smart contracts, ABIs, actions, and data tables"
				icon={FileTextIcon}
			>
				<Stack class="gap-1">
					<ExploreButton
						label="eosio"
						description="System contract"
						href={localizePath('/contract/eosio')}
					/>
					<ExploreButton
						label="eosio.token"
						description="Token contract"
						href={localizePath('/contract/eosio.token')}
					/>
					<ExploreButton
						label="unicove"
						description="Unicove contract"
						href={localizePath('/contract/unicove.gm')}
					/>
					<ExploreButton
						label="eosio.rex"
						description="REX contract"
						href={localizePath('/contract/eosio.rex')}
					/>
					<ExploreButton
						label="eosio.msig"
						description="Multi-sig contract"
						href={localizePath('/contract/eosio.msig')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard
				title="Keys"
				description="Investigate public keys and associated accounts"
				icon={KeyRoundIcon}
			>
				<Stack class="gap-1">
					<ExploreButton
						label="EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
						description="eosio system key"
						href={localizePath('/key/EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV')}
					/>
					<ExploreButton
						label="PUB_K1_6RWZ1CmDL4B6LdixuertnzxcRuUDac3NQspJEvMnebGcXY4zZj"
						description="unicove account key"
						href={localizePath('/key/PUB_K1_6RWZ1CmDL4B6LdixuertnzxcRuUDac3NQspJEvMnebGcXY4zZj')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard
				title="Network"
				description="Monitor network status and producers"
				icon={NetworkIcon}
			>
				<Stack class="gap-1">
					<ExploreButton
						label="Network Overview"
						description="Network statistics and status"
						href={localizePath('/network')}
					/>
					<ExploreButton
						label="Block Producers"
						description="Active producer list"
						href={localizePath('/producers')}
					/>
					<ExploreButton
						label="Producer eosio"
						description="System producer"
						href={localizePath('/producers/eosio')}
					/>
					<ExploreButton
						label="Producer bp1"
						description="Example producer 1"
						href={localizePath('/producers/bp1')}
					/>
					<ExploreButton
						label="Producer bp2"
						description="Example producer 2"
						href={localizePath('/producers/bp2')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard
				title="Tokens"
				description="Explore token contracts and token information"
				icon={CoinsIcon}
			>
				<Stack class="gap-1">
					<ExploreButton
						label="A"
						description="Native system token"
						href={localizePath('/token/core.vaulta/A')}
					/>
				</Stack>
			</ExploreCard>
		</div>
	</section>

	<section class="grid gap-4">
		<h2 class="text-headline">Interact</h2>
		<div class="grid grid-flow-row-dense grid-cols-2 items-start gap-6">
			<ExploreCard title="Create" description="Create new accounts" icon={UserPlus}>
				<Stack class="gap-1">
					<ExploreButton
						label="Create Account - Direct"
						description="Use an existing account to create another account"
						href={localizePath('/create-account/direct')}
					/>
					<ExploreButton
						label="Create Account - Transfer"
						description="Create an account using a basic token transfer to a smart contract"
						href={localizePath('/create-account/contract')}
					/>
					<ExploreButton
						label="Create Permission"
						description="Create a new permission for an account"
						href={localizePath(`/account/${accountName}/permissions`)}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard
				title="Send Tokens"
				description="Transfer tokens between accounts"
				icon={SendIcon}
			>
				<Stack class="gap-1">
					<ExploreButton
						label="Send Tokens"
						description="Send tokens from one account to another"
						href={localizePath('/send')}
					/>
					<ExploreButton
						label="Send RAM"
						description="Transfer RAM from one account to another"
						href={localizePath('/send/core.vaulta/RAM')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard title="RAM" description="Manage RAM resources" icon={MemoryStickIcon}>
				<Stack class="gap-1">
					<ExploreButton
						label="RAM Market"
						description="Overview of the RAM market on the network"
						href={localizePath('/ram')}
					/>
					<ExploreButton
						label="Buy RAM"
						description="Buy RAM from the network"
						href={localizePath('/ram/buy')}
					/>
					<ExploreButton
						label="Sell RAM"
						description="Sell RAM to the network"
						href={localizePath('/ram/sell')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard title="Staking" description="Manage staked tokens" icon={TrendingUpIcon}>
				<Stack class="gap-1">
					<ExploreButton
						label="Staking Overview"
						description="Overview of the staking process on the network"
						href={localizePath('/staking')}
					/>
					<ExploreButton
						label="Stake"
						description="Add tokens to a staked balance"
						href={localizePath('/staking/stake')}
					/>
					<ExploreButton
						label="Unstake"
						description="Start the unstaking process of staked tokens"
						href={localizePath('/staking/unstake')}
					/>
					<ExploreButton
						label="Withdraw"
						description="Withdraw tokens from the staking contract"
						href={localizePath('/staking/withdraw')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard title="Resources" description="Manage network resources" icon={CpuIcon}>
				<Stack class="gap-1">
					<ExploreButton
						label="Resources"
						description="Overview of account network resources and management options"
						href={localizePath('/resources')}
					/>
					<ExploreButton
						label="PowerUp"
						description="Rent CPU and/or NET resources using PowerUp"
						href={localizePath('/resources/powerup')}
					/>
					<ExploreButton
						label="REX"
						description="Rent CPU and/or NET resources using REX"
						href={localizePath('/resources/rex')}
					/>
					<ExploreButton
						label="Stake for Resources"
						description="Stake tokens to gain access to CPU and NET resources"
						href={localizePath('/resources/stake')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard title="Swaps" description="Native token swaps" icon={ArrowRightLeftIcon}>
				<Stack class="gap-1">
					<ExploreButton
						label="Swaps"
						description="List of swaps natively available on the network"
						href={localizePath('/swaps')}
					/>
				</Stack>
			</ExploreCard>

			<ExploreCard title="Delegated" description="Manage delegated tokens" icon={ShieldIcon}>
				<Stack class="gap-1">
					<ExploreButton
						label="Undelegate"
						description="Reclaim previously delegated tokens"
						href={localizePath('/undelegate')}
					/>
				</Stack>
			</ExploreCard>
		</div>
	</section>
</Stack>
