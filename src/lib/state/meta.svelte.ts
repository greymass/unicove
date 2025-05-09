import { MetaTag, MetaTaggedAccount } from '$lib/types/meta';
import { Name, type NameType, type UInt64Type } from '@wharfkit/session';

export const defaultTags: MetaTag[] = [
	MetaTag.from({
		id: 0,
		tag: 'system',
		description: 'System Contract'
	}),
	MetaTag.from({
		id: 1,
		tag: 'network',
		description: 'Network Account'
	}),
	MetaTag.from({
		id: 2,
		tag: 'producer',
		description: 'Block Producere Account'
	}),
	MetaTag.from({
		id: 3,
		tag: 'top21',
		description: 'Elected Block Producer Account'
	}),
	MetaTag.from({
		id: 4,
		tag: 'exchange',
		description: 'Known exchange account'
	})
];

const systemAccounts = ['admin.grants'];

const systemContracts = [
	'core.vaulta',
	'eosio',
	'eosio.bpay',
	'eosio.msig',
	'eosio.names',
	'eosio.prods',
	'eosio.ram',
	'eosio.ramfee',
	'eosio.reserve',
	'eosio.rex',
	'eosio.saving',
	'eosio.stake',
	'eosio.token',
	'eosio.vpay',
	'eosio.wram',
	'eosio.wrap'
];

const exchanges = ['coinbasebase', 'krakenkraken', 'okbtothemoon', 'maineosofbin', 'wallthoteos1'];

export const defaultTaggedAccounts: MetaTaggedAccount[] = [
	...systemContracts.map((a) => MetaTaggedAccount.from({ account: Name.from(a).value, tags: [0] })),
	...systemAccounts.map((a) => MetaTaggedAccount.from({ account: Name.from(a).value, tags: [1] })),
	...exchanges.map((a) => MetaTaggedAccount.from({ account: Name.from(a).value, tags: [4] }))
];

export class MetaState {
	public tags = $state<MetaTag[]>(defaultTags);
	public taggedAccounts = $state<MetaTaggedAccount[]>(defaultTaggedAccounts);

	public getTag(tag: UInt64Type): MetaTag | undefined {
		return this.tags.find((t) => t.id.equals(tag));
	}

	public getTaggedAccount(account: NameType): MetaTaggedAccount | undefined {
		return this.taggedAccounts.find((a) => a.account.equals(Name.from(account).value));
	}

	public getAccountTags(account: NameType): MetaTag[] {
		const taggedAccount = this.getTaggedAccount(account);
		if (!taggedAccount) {
			return [];
		}
		const tags = taggedAccount.tags.map((tag) => this.getTag(tag)).filter((t) => t !== undefined);
		return tags;
	}
}
