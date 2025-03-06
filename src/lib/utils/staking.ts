import { Asset, Int64 } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';

export interface UnstakingRecord {
	date: Date | undefined;
	balance: Asset;
	rex: Asset;
	claimable: boolean;
	savings: boolean;
}

const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
export const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export function getStakableBalance(network?: NetworkState, account?: AccountState): Asset {
	const balance = Int64.from(0);
	if (account && account.balance) {
		if (account.balance && account.balance.liquid) {
			balance.add(account.balance.liquid.units);
		}
	}
	return Asset.fromUnits(balance, network ? network.chain.systemToken!.symbol : defaultSymbol);
}

export function getStakedBalance(network?: NetworkState, account?: AccountState): Asset {
	const staked = Int64.from(0);
	if (account && account.loaded) {
		if (account.balance?.staked && network) {
			staked.add(account.balance?.staked.units);
		}
	}
	return Asset.fromUnits(staked, network ? network.chain.systemToken!.symbol : defaultSymbol);
}

export function getClaimableBalance(
	network?: NetworkState,
	account?: AccountState,
	unstaking?: Array<UnstakingRecord>
): Asset {
	// claimable buckets, rex to be sold
	const claimable = Int64.from(0);

	if (!unstaking) {
		unstaking = getUnstakingBalances(network, account);
	}

	const sum: Int64 = unstaking
		.filter((r) => r.claimable)
		.reduce((acc, r) => acc.adding(r.balance.units), Int64.from(0));
	if (sum) {
		claimable.add(sum);
	}

	return Asset.fromUnits(claimable, network ? network.chain.systemToken!.symbol : defaultSymbol);
}

export function getSellableREX(
	network?: NetworkState,
	account?: AccountState,
	unstaking?: Array<UnstakingRecord>
): Asset {
	// claimable buckets, rex to be sold
	const claimable = Int64.from(0);

	if (!unstaking) {
		unstaking = getUnstakingBalances(network, account);
	}

	const sum: Int64 = unstaking
		.filter((r) => r.claimable)
		.reduce((acc, r) => acc.adding(r.rex.units), Int64.from(0));
	if (sum) {
		claimable.add(sum);
	}

	return Asset.fromUnits(claimable, '4,REX');
}

export function getWithdrawableBalance(network?: NetworkState, account?: AccountState): Asset {
	const withdrawable = Int64.from(0);
	if (account && account.loaded && account.balance?.unstaked) {
		withdrawable.add(account.balance?.unstaked.units);
	}
	return Asset.fromUnits(withdrawable, network ? network.chain.systemToken!.symbol : defaultSymbol);
}

export function getUnstakingBalances(
	network?: NetworkState,
	account?: AccountState
): Array<UnstakingRecord> {
	// matured_rex + claimable buckets
	const records: Array<UnstakingRecord> = [];
	if (network && account && account.loaded && account.rex) {
		if (account.rex.matured_rex && account.rex.matured_rex.gt(Int64.from(0))) {
			// construct matured as one rex bucket
			const balance = network.rexToToken(
				Asset.fromUnits(account.rex.matured_rex, account.rex.rex_balance.symbol)
			);
			records.push({
				date: undefined,
				balance: Asset.fromUnits(balance.units, network.token.symbol),
				rex: Asset.fromUnits(account.rex.matured_rex, account.rex.rex_balance.symbol),
				claimable: true,
				savings: false
			});
		}

		if (account.rex.rex_maturities) {
			// transform real rex buckets
			const fiveYearsFromNow = new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 5;
			const now = new Date();
			for (const maturity of account.rex.rex_maturities) {
				if (maturity.first && maturity.second) {
					const date = new Date(maturity.first.toString() + 'Z');
					const balance = network.rexToToken(
						Asset.fromUnits(maturity.second, account.rex.rex_balance.symbol)
					);
					records.push({
						date,
						balance: Asset.fromUnits(balance.units, network.token.symbol),
						rex: Asset.fromUnits(maturity.second, account.rex.rex_balance.symbol),
						claimable: date < now,
						savings: +date > +fiveYearsFromNow
					});
				}
			}
		}
	}
	return records;
}

export function getUnstakableBalance(
	network?: NetworkState,
	account?: AccountState,
	unstaking?: Array<UnstakingRecord>
): Asset {
	if (!unstaking) {
		unstaking = getUnstakingBalances(network, account);
	}
	const savings = unstaking.find((r) => r.savings);
	return savings
		? savings.balance
		: Asset.from(0, network ? network.chain.systemToken!.symbol : defaultSymbol);
}

export function getAPR(network: NetworkState): string {
	const annualReward = 31250000;
	const totalStaked = Number(network.token.distribution?.staked.value || 0);
	// Prevent division by zero
	if (totalStaked === 0) {
		return '0';
	}
	return ((annualReward / totalStaked) * 100).toFixed(1);
}
