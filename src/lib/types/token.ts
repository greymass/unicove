import {
	Asset,
	Checksum256,
	Name,
	Struct,
	TimePointSec,
	type Checksum256Type,
	type NameType
} from '@wharfkit/antelope';

export interface TokenDefinitionType {
	symbol: Asset.SymbolType;
	chain?: Checksum256Type;
	contract?: NameType;
}

@Struct.type('token_definition')
export class TokenDefinition extends Struct {
	@Struct.field(Asset.Symbol) declare symbol: Asset.Symbol;
	@Struct.field(Checksum256, { optional: true }) declare chain?: Checksum256;
	@Struct.field(Name, { optional: true }) declare contract?: Name;

	get url(): string {
		return `${this.contract}/${String(this.symbol).toLowerCase()}`;
	}
}

@Struct.type('token_pair')
export class TokenPair extends Struct {
	@Struct.field(TokenDefinition) declare base: TokenDefinition;
	@Struct.field(TokenDefinition) declare quote: TokenDefinition;
	@Struct.field(Asset) declare price: Asset;
	@Struct.field(TimePointSec) declare updated: TimePointSec;

	get reversed(): TokenPair {
		return new TokenPair({
			base: this.quote,
			quote: this.base,
			price: Asset.fromFloat(this.price.value ? 1 / this.price.value : 0, this.base.symbol),
			updated: this.updated
		});
	}
}

@Struct.type('token_swap')
export class TokenSwap extends Struct {
	@Struct.field(TokenPair) declare pair: TokenPair;
	@Struct.field(Name) declare contract: Name;
	@Struct.field(Name) declare action: Name;
	@Struct.field(Asset) declare fee: Asset;
}

@Struct.type('distribution')
export class TokenDistribution extends Struct {
	@Struct.field(Asset) declare circulating: Asset;
	@Struct.field(Asset) declare locked: Asset;
	@Struct.field(Asset) declare staked: Asset;
	@Struct.field(Asset) declare supply: Asset;
	@Struct.field(Asset) declare max: Asset;
}

export interface TokenType {
	id: TokenDefinition;
	distribution?: TokenDistribution;
	marketcap?: Asset;
}

@Struct.type('token_media_asset')
export class TokenMediaAsset extends Struct {
	@Struct.field('string') declare light: Name;
	@Struct.field('string') declare dark: Name;
}

@Struct.type('token_media')
export class TokenMedia extends Struct {
	@Struct.field(TokenMediaAsset) declare logo: TokenMediaAsset;
}

@Struct.type('token')
export class Token extends Struct {
	@Struct.field(TokenDefinition) declare id: TokenDefinition;
	@Struct.field(TokenDistribution, { optional: true })
	declare distribution?: TokenDistribution;
	@Struct.field(TokenMedia, { optional: true }) declare media?: TokenMedia;

	get chain(): Checksum256 | undefined {
		return this.id.chain;
	}

	get contract(): Name | undefined {
		return this.id.contract;
	}

	get name(): string {
		return this.id.symbol.name;
	}

	get symbol(): Asset.Symbol {
		return this.id.symbol;
	}

	// marketcap(symbol: Asset.Symbol): Asset {
	// 	const units = this.distribution?.circulating?.units.multiply(this.price) || 0;
	// 	return Asset.fromUnits(units, symbol);
	// }
}

export type TokenBalanceStates =
	// Tokens delegated during genesis or the old eosio::delegatebw action
	| 'delegated'
	// Available token balance for the account on the token contract
	| 'liquid'
	// Legacy token balance
	| 'legacy'
	// Tokens being refunded from delegated balances, claimable with eosio::refund
	| 'refunding'
	// REX balance represented as staked system tokens
	| 'staked'
	// Total balance of all owned system tokens
	| 'total'
	// System tokens idle in the eosio.rex contract (likely from eosio::sellrex)
	| 'unstaked';

@Struct.type('token_balance_base')
export class TokenBalanceBase extends Struct {
	@Struct.field(TokenDefinition) declare id: TokenDefinition;
	@Struct.field(Asset) declare balance: Asset;
}

@Struct.type('token_balance_child')
export class TokenBalanceChild extends TokenBalanceBase {
	@Struct.field(Name) declare name: Name;
}

@Struct.type('token_balance')
export class TokenBalance extends TokenBalanceBase {
	@Struct.field(TokenBalanceChild, { array: true, optional: true })
	declare children?: TokenBalanceChild[];
	@Struct.field('bool', { optional: true }) declare locked?: boolean;

	child(name: NameType): TokenBalanceChild {
		if (this.children) {
			const balance = this.children.find((c) => c.name.equals(name));
			if (balance) {
				return balance;
			}
		}
		return new TokenBalanceChild({
			name: Name.from(name),
			id: this.id,
			balance: Asset.fromUnits(0, this.id.symbol)
		});
	}
}

@Struct.type('token_sources')
export class TokenDataSources extends Struct {
	@Struct.field(TimePointSec) declare ts: TimePointSec;
	@Struct.field(Asset, { optional: true }) declare mockPrice?: Asset;
	@Struct.field(TokenPair, { array: true }) declare pairs: TokenPair[];
}

export function tokenEquals(first: TokenDefinition, second: TokenDefinition) {
	return (
		String(first.chain) === String(second.chain) &&
		String(first.contract) === String(second.contract) &&
		String(first.symbol) === String(second.symbol)
	);
}
