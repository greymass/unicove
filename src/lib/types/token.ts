import { Asset, Checksum256, Name, Struct, TimePoint } from '@wharfkit/antelope';
import { TokenMeta as WharfTokenMeta, type TokenMetaType } from '@wharfkit/common';

@Struct.type('token_sources')
export class TokenDataSources extends Struct {
	@Struct.field(TimePoint) declare updated: TimePoint;
}

@Struct.type('token_definition')
export class TokenDefinition extends Struct {
	@Struct.field(Asset.Symbol) declare symbol: Asset.Symbol;
}

@Struct.type('token_definition')
export class TokenDefinitionAntelope extends TokenDefinition {
	@Struct.field(Checksum256) declare chainId: Checksum256;
	@Struct.field(Name) declare contract: Name;
}

@Struct.type('token_pair')
export class TokenPair extends Struct {
	@Struct.field(TokenDefinition) declare base: TokenDefinition;
	@Struct.field(TokenDefinition) declare quote: TokenDefinition;
	@Struct.field(Asset) declare price: Asset;
}

@Struct.type('distribution')
export class TokenDistribution extends Struct {
	@Struct.field(Asset) declare circulating: Asset;
	@Struct.field(Asset) declare locked: Asset;
	@Struct.field(Asset) declare staked: Asset;
	@Struct.field(Asset) declare supply: Asset;
	@Struct.field(Asset) declare max: Asset;
}

@Struct.type('token_meta')
export class TokenMeta extends WharfTokenMeta {
	@Struct.field('string', { optional: true }) declare website?: string;
}

export interface TokenType {
	meta: TokenMetaType;
	distribution?: TokenDistribution;
	marketcap?: Asset;
	price: Asset;
	prices: Asset[];
}

@Struct.type('token')
export class Token extends Struct {
	@Struct.field(TokenMeta) declare meta: TokenMeta;
	@Struct.field(TokenDistribution, { optional: true })
	declare distribution?: TokenDistribution;
	@Struct.field(Asset, { optional: true }) declare marketcap?: Asset;
	@Struct.field(Asset, { array: true }) declare prices: Asset[];
	@Struct.field(Asset) declare price: Asset;

	get chain(): Checksum256 {
		return this.meta.id.chain;
	}

	get contract(): Name {
		return this.meta.id.contract;
	}

	get symbol(): Asset.Symbol {
		return this.meta.id.symbol;
	}
}

export const Tokens: Record<string, TokenDefinition> = {
	BTC: TokenDefinition.from({
		symbol: '8,BTC'
	}),
	CAD: TokenDefinition.from({
		symbol: '4,CAD'
	}),
	EUR: TokenDefinition.from({
		symbol: '4,EUR'
	}),
	CNY: TokenDefinition.from({
		symbol: '4,CNY'
	}),
	ETH: TokenDefinition.from({
		symbol: '18,ETH'
	}),
	USD: TokenDefinition.from({
		symbol: '4,USD'
	})
};
