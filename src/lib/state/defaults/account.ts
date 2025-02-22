import { API, Asset, Checksum256, Float64, Int64, Name } from '@wharfkit/antelope';

import { gifted_ram, type AccountDataSources, type VoterInfo } from '$lib/types/account';

import * as SystemContract from '$lib/wharf/contracts/system';

export const defaultGetAccount = API.v1.AccountObject.from({
	account_name: '',
	head_block_num: 0,
	head_block_time: '1970-01-01T00:00:00.000',
	privileged: false,
	last_code_update: '1970-01-01T00:00:00.000',
	created: '1970-01-01T00:00:00.000',
	ram_quota: 0,
	net_weight: 0,
	cpu_weight: 0,
	net_limit: {
		used: 0,
		available: 0,
		max: 0,
		last_usage_update_time: '1970-01-01T00:00:00.000',
		current_used: 0
	},
	cpu_limit: {
		used: 0,
		available: 0,
		max: 0,
		last_usage_update_time: '1970-01-01T00:00:00.000',
		current_used: 0
	},
	subjective_cpu_bill_limit: {
		used: 0,
		available: 0,
		max: 0,
		last_usage_update_time: '1970-01-01T00:00:00.000',
		current_used: 0
	},
	ram_usage: 0,
	permissions: [],
	total_resources: {
		owner: '',
		net_weight: '0.0000 EOS',
		cpu_weight: '0.0000 EOS',
		ram_bytes: 0
	}
});

export const defaultAsset = Asset.from('0 ');

export const defaultGiftedRam = gifted_ram.from({
	gifter: '',
	giftee: '',
	ram_bytes: 0
});

export const defaultRefundRequest = SystemContract.Types.refund_request.from({
	owner: '',
	request_time: '1970-01-01T00:00:00',
	net_amount: '0 ',
	cpu_amount: '0 '
});

export const defaultRexBalance = SystemContract.Types.rex_balance.from({
	version: 0,
	owner: '',
	vote_stake: '0 ',
	rex_balance: '0 ',
	matured_rex: 0,
	rex_maturities: []
});

export const defaultRexFund = SystemContract.Types.rex_fund.from({
	version: 0,
	owner: '',
	balance: '0 '
});

export const nullContractHash = Checksum256.from(
	'0000000000000000000000000000000000000000000000000000000000000000'
);

export const defaultAccountDataSources: AccountDataSources = {
	get_account: defaultGetAccount,
	contract_hash: nullContractHash,
	balance: defaultAsset,
	light_api: [],
	delegated: [],
	giftedram: defaultGiftedRam,
	proposals: [],
	refund_request: defaultRefundRequest,
	rexbal: defaultRexBalance,
	rexfund: defaultRexFund
};

export const defaultVoteInfo: VoterInfo = {
	isProxy: false,
	proxy: Name.from(''),
	proxyWeight: Float64.from(0),
	weight: Float64.from(0),
	votes: [],
	staked: Int64.from(0)
};
