import { Asset, Checksum256, Name, Struct, TimePointSec } from '@wharfkit/antelope';

@Struct.type('token_definition')
export class TokenDefinition extends Struct {
	@Struct.field(Asset.Symbol) declare symbol: Asset.Symbol;
	@Struct.field(Checksum256, { optional: true }) declare chain?: Checksum256;
	@Struct.field(Name, { optional: true }) declare contract?: Name;
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
	// price: Asset;
}

@Struct.type('token')
export class Token extends Struct {
	@Struct.field(TokenDefinition) declare id: TokenDefinition;
	@Struct.field(TokenDistribution, { optional: true })
	declare distribution?: TokenDistribution;
	// @Struct.field(Asset) declare price: Asset;

	get chain(): Checksum256 | undefined {
		return this.id.chain;
	}

	get contract(): Name | undefined {
		return this.id.contract;
	}

	get symbol(): Asset.Symbol {
		return this.id.symbol;
	}

	// marketcap(symbol: Asset.Symbol): Asset {
	// 	const units = this.distribution?.circulating?.units.multiply(this.price) || 0;
	// 	return Asset.fromUnits(units, symbol);
	// }
}

@Struct.type('token_balance')
export class TokenBalance extends Struct {
	@Struct.field(Token) declare token: Token;
	@Struct.field(Asset) declare balance: Asset;
}

@Struct.type('token_sources')
export class TokenDataSources extends Struct {
	@Struct.field(TimePointSec) declare ts: TimePointSec;
	@Struct.field(TokenPair, { array: true }) declare pairs: TokenPair[];
}
