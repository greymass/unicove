import { Asset, Int64 } from '@wharfkit/antelope';
import type { AccountState } from '$lib/state/client/account.svelte';
import type { NetworkState } from '$lib/state/network.svelte';

export interface UnstakingRecord {
	date: Date | undefined;
	balance: Asset;
	claimable: boolean;
	savings: boolean;
}

const defaultSymbol = Asset.Symbol.from('0,UNKNOWN');
export const defaultQuantity = Asset.fromUnits(0, defaultSymbol);

export function getStakableBalance(network: NetworkState, account: AccountState): Asset {
	let balance = Int64.from(0);
	if (account && account.balance) {
		if (account.balance && account.balance.liquid) {
			balance.add(account.balance.liquid.units);
		}

		// TODO: add rexfund
	}
	return Asset.fromUnits(balance, network.chain.systemToken!.symbol);
}

export function getStakedBalance(network: NetworkState, account: AccountState): Asset {
	let staked = Asset.fromUnits(0, network.chain.systemToken!.symbol);
	if (account && account.loaded && account.account) {
		const rexInfo = account.account.data.rex_info;
		if (rexInfo) {
			staked = network.rexToToken(rexInfo.rex_balance);
		}
	}
	return staked;
}

export function getClaimableBalance(
	network: NetworkState,
	account: AccountState,
	unstaking: Array<UnstakingRecord>
): Asset {
	// withdrawable(rex_fund) + claimable
	let claimable: Asset = Asset.from(0, network.chain.systemToken!.symbol);

	if (account && account.loaded && account.account) {
		const rexInfo = account.account.data.rex_info;
		if (rexInfo) {
			let matured = Int64.from(0);
			const sum: Int64 = unstaking
				.filter((r) => r.claimable)
				.reduce((acc, r) => acc.adding(r.balance.units), Int64.from(0));
			if (sum) {
				matured.add(sum);
			}

			if (matured.gt(Int64.from(0))) {
				claimable = Asset.fromUnits(matured, network.chain.systemToken!.symbol);
			}
		}
	}

	return claimable;
}

export function getWithdrawableBalance(network: NetworkState, account: AccountState): Asset {
	// TODO: add rex fund
	return Asset.from(0, network.chain.systemToken!.symbol);
}

export function getUnstakingBalances(
	network: NetworkState,
	account: AccountState
): Array<UnstakingRecord> {
	// matured_rex + claimable buckets
	let records: Array<UnstakingRecord> = [];
	if (account && account.loaded && account.account) {
		const rexInfo = account.account.data.rex_info;
		if (rexInfo) {
			if (rexInfo.matured_rex && rexInfo.matured_rex.gt(Int64.from(0))) {
				// add matured into balances
				records.push({
					date: undefined,
					balance: network.rexToToken(
						Asset.fromUnits(rexInfo.matured_rex, rexInfo.rex_balance.symbol)
					),
					claimable: true,
					savings: false
				});
			}

			const fiveYearsFromNow = new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 5;
			const now = new Date();
			for (const maturity of rexInfo.rex_maturities) {
				if (maturity.first && maturity.second) {
					const date = new Date(maturity.first.toString());
					records.push({
						date,
						balance: network.rexToToken(
							Asset.fromUnits(maturity.second, rexInfo.rex_balance.symbol)
						),
						claimable: +date < +now,
						savings: +date > +fiveYearsFromNow
					});
				}
			}
		}
	}
	return records;
}

export function getUnstakableBalance(network: NetworkState, account: AccountState): Asset {
	const savings = getUnstakingBalances(network, account).find((r) => r.savings);
	return savings ? savings.balance : Asset.from(0, network.chain.systemToken!.symbol);
}

export function getAPY(network: NetworkState): string {
	const annualReward = 31250000;
	const totalStaked = Number(network.rexstate!.total_lendable.value);
	return ((annualReward / totalStaked) * 100).toFixed(2);
}
